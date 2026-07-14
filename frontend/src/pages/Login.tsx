import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Boxes, Github } from "lucide-react";
import { useAuth } from "../lib/auth";

export default function Login() {
  const { login, user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [loading, user, navigate]);

  async function handleLogin() {
    setBusy(true);
    setError(null);
    try {
      await login();
    } catch {
      setError(
        "Could not start GitHub sign-in. Is the backend running and GitHub OAuth configured?",
      );
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft">
            <Boxes className="h-7 w-7 text-accent" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">DevPilot AI</h1>
          <p className="mt-1 text-sm text-ink-soft">Your personalized developer workspace</p>
        </div>

        <button
          onClick={handleLogin}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#24292f] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#32383f] disabled:opacity-60"
        >
          <Github className="h-4 w-4" />
          {busy ? "Redirecting…" : "Continue with GitHub"}
        </button>

        {error && <p className="mt-4 text-center text-xs text-danger">{error}</p>}

        <p className="mt-6 text-center text-xs text-ink-faint">
          By continuing you agree to connect your GitHub account. We only read your public profile.
        </p>
      </div>
    </div>
  );
}
