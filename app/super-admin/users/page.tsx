import type { Metadata } from "next";
import { AdminUsersClient } from "@/features/admin/components/AdminUsersClient";

export const metadata: Metadata = { title: "Kelola Pengguna — Super Admin" };

export default function SuperAdminUsersPage() {
  return <AdminUsersClient />;
}
