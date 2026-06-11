import type { Metadata } from "next";
import { AdminDashboardClient } from "@/features/admin/components/AdminDashboardClient";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}
