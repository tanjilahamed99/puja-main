export const metadata = {
  title: "Live Session",
};

export default function LiveLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white">{children}</div>
  );
}