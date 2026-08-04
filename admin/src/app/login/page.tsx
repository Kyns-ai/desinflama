import { expectedPassword } from "@/lib/auth";
import { usingMock } from "@/lib/env";
import { Marca } from "@/components/Marca";
import { LoginForm } from "./LoginForm";
import { DEMO_PASSWORD } from "@/lib/constants";

export default function Login() {
  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <Marca size={44} className="rounded-xl" />
          <div>
            <p className="font-display text-xl font-semibold text-ink">Desinflama</p>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
              Painel admin
            </p>
          </div>
        </div>
        <LoginForm demo={usingMock && expectedPassword() === DEMO_PASSWORD} />
      </div>
    </div>
  );
}
