import TeacherSidebar from "@/components/Teacher/Teachersidebar";


export default function TeacherLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-ivory">
      <TeacherSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}