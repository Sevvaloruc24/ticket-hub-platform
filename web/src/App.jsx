import React, { useState, useEffect } from 'react';

const USER_ID = 'user-' + Math.random().toString(36).substring(2, 9);

export default function App() {
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [lockTtl, setLockTtl] = useState(0);
  const [email, setEmail] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchSeats = async () => {
    try {
      const res = await fetch('/api/seats');
      if (res.ok) {
        const data = await res.json();
        setSeats(data);
      }
    } catch (err) {
      console.error('Failed to fetch seats', err);
    }
  };

  useEffect(() => {
    fetchSeats();
    const interval = setInterval(fetchSeats, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (lockTtl <= 0) return;
    const timer = setInterval(() => {
      setLockTtl((prev) => {
        if (prev <= 1) {
          setSelectedSeat(null);
          fetchSeats();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockTtl]);

  const handleSeatClick = async (seat) => {
    if (seat.status === 'SOLD') return;

    if (selectedSeat?.id === seat.id) {
      try {
        setLoading(true);
        await fetch(`/api/seats/${seat.id}/unlock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: USER_ID })
        });
        setSelectedSeat(null);
        setLockTtl(0);
        setStatusMsg(`Seat ${seat.seat_number} released.`);
        fetchSeats();
      } catch {
        setStatusMsg('Failed to release lock');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (seat.status === 'LOCKED' && seat.lockedBy !== USER_ID) return;

    try {
      setLoading(true);
      setStatusMsg('');
      const res = await fetch(`/api/seats/${seat.id}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: USER_ID })
      });
      const data = await res.json();

      if (res.ok) {
        setSelectedSeat(seat);
        setLockTtl(data.ttl);
        setStatusMsg(`Seat ${seat.seat_number} reserved! Please complete purchase.`);
        fetchSeats();
      } else {
        setStatusMsg(data.error || 'Failed to acquire lock');
      }
    } catch {
      setStatusMsg('Network error locking seat');
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (e) => {
    e.preventDefault();
    if (!selectedSeat || !email) return;

    try {
      setLoading(true);
      setStatusMsg('Processing payment...');
      const res = await fetch('/api/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seatId: selectedSeat.id,
          userId: USER_ID,
          customerEmail: email
        })
      });
      const data = await res.json();

      if (res.ok) {
        setStatusMsg(`Success! Ticket purchased. Order ID: ${data.orderId}`);
        setSelectedSeat(null);
        setLockTtl(0);
        fetchSeats();
      } else {
        setStatusMsg(`Purchase failed: ${data.error}`);
      }
    } catch {
      setStatusMsg('Payment network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>TicketHub Platform</h1>
      <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '1.5rem' }}>
        User ID: <code>{USER_ID}</code>
      </p>

      <div className="stage">STAGE / SCREEN</div>

      <div className="grid">
        {seats.map((seat) => {
          const isSelected = selectedSeat?.id === seat.id;
          const statusClass = seat.status === 'SOLD' ? 'sold' : seat.status === 'LOCKED' ? 'locked' : 'available';
          return (
            <div
              key={seat.id}
              className={`seat ${statusClass} ${isSelected ? 'my-lock' : ''}`}
              onClick={() => handleSeatClick(seat)}
            >
              <span>{seat.seat_number}</span>
              <small>{seat.price}₺</small>
            </div>
          );
        })}
      </div>

      {statusMsg && (
        <div style={{ padding: '0.75rem', background: '#334155', borderRadius: '6px', marginBottom: '1rem', textAlign: 'center' }}>
          {statusMsg}
        </div>
      )}

      {selectedSeat && (
        <form className="checkout-box" onSubmit={handleBuy}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Selected Seat: {selectedSeat.seat_number} ({selectedSeat.price}₺)</strong>
            <span>
              Expires in: <span className="timer-badge">{lockTtl}s</span>
            </span>
          </div>
          <input
            type="email"
            className="input-field"
            placeholder="Enter customer email (e.g. user@example.com)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn-buy" disabled={loading || lockTtl <= 0}>
            {loading ? 'Processing...' : `Pay & Complete Purchase (${selectedSeat.price}₺)`}
          </button>
        </form>
      )}
    </div>
  );
}
