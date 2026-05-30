import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { SourceBadge } from "@/components/ui";
import { isAuthed } from "@/lib/auth";
import { usingMock } from "@/lib/env";
import { logout } from "./actions";

export default async function DashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthed())) redirect("/login");

  return (
    <div className="min-h-dvh bg-canvas">
      <Sidebar />
      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-canvas/85 px-5 backdrop-blur-xl">
          <SourceBadge source={usingMock ? "mock" : "supabase"} />
          <form action={logout}>
            <button className="flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink">
              <LogOut className="size-4" /> Sair
            </button>
          </form>
        </header>
        <main className="mx-auto max-w-6xl px-5 py-7">{children}</main>
      </div>
    </div>
  );
}
