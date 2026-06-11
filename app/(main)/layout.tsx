import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileHeader } from "@/components/layout/MobileHeader";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-dark">
      {/* Mobile Header */}
      <MobileHeader user={session.user} />

      <div className="max-w-screen-xl mx-auto flex">
        {/* Left Sidebar — hidden on mobile */}
        <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 sticky top-0 h-screen overflow-y-auto py-4 pr-2">
          <LeftSidebar user={session.user} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 border-x border-dark-300 min-h-screen pb-20 lg:pb-0">
          {children}
        </main>

        {/* Right Sidebar — only on xl */}
        <aside className="hidden xl:flex flex-col w-72 2xl:w-80 shrink-0 sticky top-0 h-screen overflow-y-auto py-4 pl-2">
          <RightSidebar />
        </aside>
      </div>

      {/* Bottom Nav — only mobile */}
      <BottomNav />
    </div>
  );
}
