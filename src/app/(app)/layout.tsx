import { AppShell } from "@/components/AppShell";
import { TabBar } from "@/components/TabBar";
import { AppBootstrap } from "@/components/AppBootstrap";

export default function TabbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppBootstrap>
      <AppShell>{children}</AppShell>
      <TabBar />
    </AppBootstrap>
  );
}
