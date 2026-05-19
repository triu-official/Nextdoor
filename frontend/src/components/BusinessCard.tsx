import type { Business, User } from '../../../shared/src/models';
import { haversineKm } from '../../../shared/src/geo';

export function BusinessCard({ business, user }: { business: Business; user: User }) {
  const distance = haversineKm(user.lat, user.lng, business.lat, business.lng).toFixed(1);

  return (
    <article className="card">
      {business.imageUrl ? <img src={business.imageUrl} alt={business.name} className="thumb" /> : null}
      <h3>{business.name}</h3>
      <p className="meta">{business.category} • {distance} km away</p>
      <p>{business.shortDescription}</p>
      <div className="row">
        <a href={`tel:${business.phone}`}>Call</a>
        {business.whatsapp ? <a href={`https://wa.me/${business.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a> : null}
      </div>
    </article>
  );
}
