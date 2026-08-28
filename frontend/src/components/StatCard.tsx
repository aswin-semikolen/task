interface StatCardProps {
  label: string;
  value: number;
  tone?: 'default' | 'success' | 'muted' | 'accent';
}

export default function StatCard({ label, value, tone = 'default' }: StatCardProps) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
