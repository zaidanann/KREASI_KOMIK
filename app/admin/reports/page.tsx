import type { Metadata } from "next";
import { AdminReportsClient } from "@/features/admin/components/AdminReportsClient";

export const metadata: Metadata = { title: "Laporan — Admin" };

export default function AdminReportsPage() {
  return <AdminReportsClient />;
}
