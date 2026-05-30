"use client";

import { useRouter } from "next/navigation";
import { Paywall } from "@/components/Paywall";

export default function PaywallPage() {
  const router = useRouter();
  return (
    <div className="-mt-[var(--safe-top)]">
      <Paywall
        onClose={() => router.back()}
        onPurchased={() => router.replace("/inicio")}
      />
    </div>
  );
}
