export default function StatusBadge({ status }) {
  const normalized = String(status).toUpperCase();
  const className = {
    ACTIVE: 'badge badge-success',
    INACTIVE: 'badge badge-muted',
    BOOKED: 'badge badge-info',
    CANCELLED: 'badge badge-danger',
  }[normalized] || 'badge';

  return <span className={className}>{normalized}</span>;
}
