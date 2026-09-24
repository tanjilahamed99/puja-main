export default function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-2">{label}</label>
      {children}
    </div>
  );
}
