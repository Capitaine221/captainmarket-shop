"use client";

import { useActionState } from "react";
import { loginAction } from "../../actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
      <form action={formAction} className="w-full max-w-sm space-y-4 p-8 border border-neutral-800 rounded-lg">
        <h1 className="text-xl font-semibold">Connexion admin</h1>
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          required
          className="w-full rounded-md bg-neutral-900 border border-neutral-700 px-3 py-2 outline-none focus:border-white"
        />
        {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-white text-black font-medium py-2 disabled:opacity-50"
        >
          {pending ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
