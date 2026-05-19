import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { signUp, verifyOtp } from '../api/authApi';
import { useUserContext } from '../context/UserContext';

export function OnboardingPage() {
  const { user, setUser } = useUserContext();
  const [form, setForm] = useState({ name: '', phone: '', city: 'Mumbai', locality: 'Bandra West', pincode: '' });
  const [otp, setOtp] = useState('');
  const [pendingUserId, setPendingUserId] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to="/feed" replace />;
  }

  return (
    <div className="screen">
      <h1>Join your neighborhood</h1>
      {!pendingUserId ? (
        <form
          className="stack"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              const response = await signUp({ ...form, pincode: form.pincode || undefined });
              setPendingUserId(response.user.id);
              setDemoOtp(response.otp);
              setError('');
            } catch (err) {
              setError((err as Error).message);
            }
          }}
        >
          <input placeholder="Name" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          <input placeholder="Phone" value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
          <input placeholder="City" value={form.city} onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))} />
          <input
            placeholder="Locality"
            value={form.locality}
            onChange={(event) => setForm((prev) => ({ ...prev, locality: event.target.value }))}
          />
          <input
            placeholder="Pincode (optional)"
            value={form.pincode}
            onChange={(event) => setForm((prev) => ({ ...prev, pincode: event.target.value }))}
          />
          <button type="submit">Sign up</button>
        </form>
      ) : (
        <form
          className="stack"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              const response = await verifyOtp({ userId: pendingUserId, otp });
              localStorage.setItem('userId', response.user.id);
              setUser(response.user);
            } catch (err) {
              setError((err as Error).message);
            }
          }}
        >
          <p className="otp-demo">Demo OTP: {demoOtp}</p>
          <input placeholder="Enter OTP" value={otp} onChange={(event) => setOtp(event.target.value)} />
          <button type="submit">Verify OTP</button>
        </form>
      )}
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
