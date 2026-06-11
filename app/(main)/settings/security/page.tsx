import type { Metadata } from "next";
import { ChangePasswordForm } from "@/features/auth/components/ChangePasswordForm";

export const metadata: Metadata = { title: "Keamanan" };

export default function SecurityPage() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="sticky top-0 z-30 glass border-b border-dark-300 px-4 py-3">
        <h1 className="text-lg font-bold">Keamanan</h1>
      </div>
      <div className="p-4">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
