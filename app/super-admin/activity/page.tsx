import type { Metadata } from "next";
import { ActivityLogClient } from "@/features/admin/components/ActivityLogClient";

export const metadata: Metadata = { title: "Log Aktivitas — Super Admin" };

export default function ActivityPage() {
  return <ActivityLogClient />;
}
