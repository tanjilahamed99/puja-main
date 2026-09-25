import Sidebar from "@/components/admin/Sidebar";
import PrivateRoutes from "@/components/PrivateRoute";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-ivory">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <PrivateRoutes allowedRoles={["admin"]}>{children}</PrivateRoutes>
      </div>
    </div>
  );
}
