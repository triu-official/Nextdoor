import { useEffect, useState } from 'react';
import type { Business } from '../../../shared/src/models';
import { createBusiness, getBusinesses } from '../api/businessApi';
import { BusinessCard } from '../components/BusinessCard';
import { useUserContext } from '../context/UserContext';

const categoryOptions = ['cafe', 'tiffin', 'salon', 'coach', 'plumber'];

export function NewNearbyPage() {
  const { user, businessRadiusKm, setBusinessRadiusKm } = useUserContext();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [category, setCategory] = useState('');
  const [form, setForm] = useState({
    name: '',
    category: 'cafe',
    shortDescription: '',
    address: '',
    phone: '',
    whatsapp: '',
    imageUrl: '',
    avgRating: 4
  });

  async function loadBusinesses(): Promise<void> {
    if (!user) {
      return;
    }
    const response = await getBusinesses(user.id, businessRadiusKm, category || undefined);
    setBusinesses(response.items);
  }

  useEffect(() => {
    void loadBusinesses();
  }, [user?.id, businessRadiusKm, category]);

  if (!user) {
    return <div className="screen">Please complete onboarding.</div>;
  }

  return (
    <section className="screen">
      <h2>New Nearby</h2>
      <div className="row">
        {[1, 3, 5].map((radius) => (
          <button key={radius} className={radius === businessRadiusKm ? 'chip active' : 'chip'} onClick={() => setBusinessRadiusKm(radius)}>
            {radius}km
          </button>
        ))}
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">All categories</option>
          {categoryOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <form
        className="card stack"
        onSubmit={async (event) => {
          event.preventDefault();
          await createBusiness({
            ownerUserId: user.id,
            name: form.name,
            category: form.category,
            shortDescription: form.shortDescription,
            city: user.city,
            locality: user.locality,
            address: form.address,
            lat: user.lat,
            lng: user.lng,
            phone: form.phone,
            whatsapp: form.whatsapp || undefined,
            imageUrl: form.imageUrl || undefined,
            avgRating: Number(form.avgRating)
          });
          setForm({ name: '', category: 'cafe', shortDescription: '', address: '', phone: '', whatsapp: '', imageUrl: '', avgRating: 4 });
          await loadBusinesses();
        }}
      >
        <input placeholder="Business name" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
        <select value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}>
          {categoryOptions.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <input
          placeholder="Short description"
          value={form.shortDescription}
          onChange={(event) => setForm((prev) => ({ ...prev, shortDescription: event.target.value }))}
        />
        <input placeholder="Address" value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} />
        <input placeholder="Phone" value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
        <button type="submit">Add Business</button>
      </form>

      <div className="stack">
        {businesses.map((business) => (
          <BusinessCard key={business.id} business={business} user={user} />
        ))}
      </div>
    </section>
  );
}
