import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-ivory">
      <Sidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
