import { AppShell } from "@/components/AppShell";
import { TabBar } from "@/components/TabBar";

export default function TabbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppShell>{children}</AppShell>
      <TabBar />
    </>
  );
}
