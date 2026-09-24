export default function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-inkSoft">{label}</p>
          <p className="font-display text-2xl font-semibold mt-1.5 text-ink">{value}</p>
        </div>
        {Icon && (
          <div className="bg-goldSoft/40 text-maroon p-2 rounded-lg shrink-0">
            <Icon size={18} />
          </div>
        )}
      </div>
      {hint && <p className="text-xs text-inkSoft mt-3">{hint}</p>}
    </div>
  );
}
