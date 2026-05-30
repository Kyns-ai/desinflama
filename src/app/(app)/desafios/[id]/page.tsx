import { MONTHLY_CHALLENGES } from "@/content/challenges";
import { ChallengeView } from "./ChallengeView";

export function generateStaticParams() {
  return MONTHLY_CHALLENGES.map((c) => ({ id: c.id }));
}

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ChallengeView id={id} />;
}
