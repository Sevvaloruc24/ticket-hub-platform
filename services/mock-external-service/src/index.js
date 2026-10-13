const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get('/healthz', (req, res) => res.json({ status: 'ok' }));

app.post('/pay', (req, res) => {
  const { amount, seatId, customerEmail } = req.body;
  if (!amount || !seatId || !customerEmail) {
    return res.status(400).json({ error: 'Missing required payment fields' });
  }

  // %90 Başarılı simülasyonu
  const isSuccessful = Math.random() < 0.9;
  if (!isSuccessful) {
    return res.status(402).json({ error: 'Payment declined by bank mock' });
  }

  const transactionId = 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  return res.status(200).json({
    status: 'SUCCESS',
    transactionId,
    amount,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Mock Payment Service listening on port ${PORT}`);
});
