import type { Metadata } from "next";
import { AdminUsersClient } from "@/features/admin/components/AdminUsersClient";

export const metadata: Metadata = { title: "Kelola Pengguna — Admin" };

export default function AdminUsersPage() {
  return <AdminUsersClient />;
}
