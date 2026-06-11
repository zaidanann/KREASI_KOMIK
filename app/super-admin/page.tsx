import type { Metadata } from "next";
import { AdminDashboardClient } from "@/features/admin/components/AdminDashboardClient";

export const metadata: Metadata = { title: "Super Admin Dashboard" };

export default function SuperAdminPage() {
  return (
    <div>
      <div className="mb-2">
        <span className="text-xs bg-brand/20 text-brand px-2 py-1 rounded-full font-semibold">
          Super Admin Panel
        </span>
      </div>
      <AdminDashboardClient />
    </div>
  );
}
