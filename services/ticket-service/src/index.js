require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const redis = require('./redis');
const { register, httpRequestsTotal, ticketPurchasesTotal } = require('./metrics');

const app = express();
const PORT = process.env.PORT || 3000;
const LOCK_TTL = parseInt(process.env.LOCK_TTL_SECONDS || '120', 10);
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:4000';

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.on('finish', () => {
    const route = req.route ? req.route.path : req.path;
    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: res.statusCode
    });
  });
  next();
});

app.get('/healthz', (req, res) => res.json({ status: 'ok' }));

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.get('/seats', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, seat_number, section, price, status FROM seats ORDER BY id ASC');
    const enriched = await Promise.all(
      rows.map(async (seat) => {
        if (seat.status === 'SOLD') return seat;
        const lockVal = await redis.get(`lock:seat:${seat.id}`);
        if (lockVal) {
          const ttl = await redis.ttl(`lock:seat:${seat.id}`);
          return { ...seat, status: 'LOCKED', lockTtl: ttl };
        }
        return { ...seat, status: 'AVAILABLE', lockTtl: 0 };
      })
    );
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/seats/:id/lock', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    const checkSeat = await db.query('SELECT status FROM seats WHERE id = $1', [id]);
    if (checkSeat.rows.length === 0) {
      return res.status(404).json({ error: 'Seat not found' });
    }
    if (checkSeat.rows[0].status === 'SOLD') {
      return res.status(409).json({ error: 'Seat is already sold' });
    }

    const acquired = await redis.set(`lock:seat:${id}`, userId, 'EX', LOCK_TTL, 'NX');
    if (!acquired) {
      return res.status(409).json({ error: 'Seat is currently locked by another user' });
    }

    res.json({ message: 'Seat locked successfully', seatId: id, ttl: LOCK_TTL });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/buy', async (req, res) => {
  const { seatId, userId, customerEmail } = req.body;

  if (!seatId || !userId || !customerEmail) {
    return res.status(400).json({ error: 'seatId, userId, and customerEmail are required' });
  }

  try {
    const currentLockHolder = await redis.get(`lock:seat:${seatId}`);
    if (currentLockHolder !== userId) {
      ticketPurchasesTotal.inc({ status: 'CONFLICT' });
      return res.status(409).json({ error: 'Lock expired or belongs to another user' });
    }

    const seatRes = await db.query('SELECT * FROM seats WHERE id = $1', [seatId]);
    const seat = seatRes.rows[0];

    let paymentSuccess = false;
    let paymentRef = 'REF-MANUAL';

    try {
      const payResponse = await fetch(`${PAYMENT_SERVICE_URL}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: seat.price, seatId, customerEmail })
      });
      const payData = await payResponse.json();
      if (payResponse.ok && payData.status === 'SUCCESS') {
        paymentSuccess = true;
        paymentRef = payData.transactionId;
      }
    } catch {
      paymentSuccess = false;
    }

    if (!paymentSuccess) {
      ticketPurchasesTotal.inc({ status: 'FAILED' });
      return res.status(402).json({ error: 'Payment failed' });
    }

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('UPDATE seats SET status = $1 WHERE id = $2', ['SOLD', seatId]);
      const orderInsert = await client.query(
        'INSERT INTO orders (seat_id, customer_email, amount, payment_reference, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [seatId, customerEmail, seat.price, paymentRef, 'COMPLETED']
      );
      await client.query('COMMIT');

      await redis.del(`lock:seat:${seatId}`);
      ticketPurchasesTotal.inc({ status: 'SUCCESS' });

      res.status(201).json({
        message: 'Ticket purchased successfully',
        orderId: orderInsert.rows[0].id,
        seatNumber: seat.seat_number,
        paymentReference: paymentRef
      });
    } catch (dbErr) {
      await client.query('ROLLBACK');
      throw dbErr;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Ticket Service running on port ${PORT}`);
});
