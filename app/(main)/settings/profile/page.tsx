import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EditProfileForm } from "@/features/profile/components/EditProfileForm";

export const metadata: Metadata = { title: "Edit Profil" };

export default async function EditProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    include: { profile: true },
  });

  return (
    <div className="max-w-xl mx-auto">
      <div className="sticky top-0 z-30 glass border-b border-dark-300 px-4 py-3">
        <h1 className="text-lg font-bold">Edit Profil</h1>
      </div>
      <div className="p-4">
        <EditProfileForm user={user} />
      </div>
    </div>
  );
}
