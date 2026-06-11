import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/features/admin/components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/");
  }
  return (
    <div className="min-h-screen bg-dark flex">
      <AdminSidebar role={session.user.role} />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
