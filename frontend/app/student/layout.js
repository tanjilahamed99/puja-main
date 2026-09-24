import StudentSidebar from "@/components/Students/StudentSidebar";

export default function StudentLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-ivory">
      <StudentSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
