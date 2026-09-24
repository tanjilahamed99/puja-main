const VARIANTS = {
  success: 'bg-[#E4F0E6] text-success',
  warning: 'bg-[#FBF0DA] text-warning',
  danger: 'bg-[#F7E5E5] text-danger',
  neutral: 'bg-ivorySoft text-inkSoft',
};

export default function Badge({ children, variant = 'neutral' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
        VARIANTS[variant] || VARIANTS.neutral
      }`}
    >
      {children}
    </span>
  );
}
