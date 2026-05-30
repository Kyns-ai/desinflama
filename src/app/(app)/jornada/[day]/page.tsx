import { DayView } from "./DayView";

// Pré-renderiza os dias 1–21 (desafio principal + extensão Reset) no export estático.
export function generateStaticParams() {
  return Array.from({ length: 21 }, (_, i) => ({ day: String(i + 1) }));
}

export default async function DayPage({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  const { day } = await params;
  return <DayView day={Number(day)} />;
}
