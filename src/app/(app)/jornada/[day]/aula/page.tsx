import { LessonReader } from "./LessonReader";

export function generateStaticParams() {
  return Array.from({ length: 21 }, (_, i) => ({ day: String(i + 1) }));
}

export default async function AulaPage({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  const { day } = await params;
  return <LessonReader day={Number(day)} />;
}
