import { usingMock } from "@/lib/env";
import { LoginForm } from "./LoginForm";

export default function Login() {
  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand.svg" alt="" className="size-11 rounded-xl" />
          <div>
            <p className="font-display text-xl font-semibold text-ink">Desinflama</p>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
              Painel admin
            </p>
          </div>
        </div>
        <LoginForm demo={usingMock} />
      </div>
    </div>
  );
}
