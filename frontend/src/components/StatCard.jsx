export default function StatCard({ label, value, accent }) {
  return (
    <div className={`stat-card${accent ? ` stat-card-${accent}` : ''}`}>
      <p className="stat-card-value">{value}</p>
      <p className="stat-card-label">{label}</p>
    </div>
  );
}
