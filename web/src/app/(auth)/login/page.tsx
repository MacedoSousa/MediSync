"use client";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-8 space-y-6 border border-slate-100">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-slate-800">MediSync</h1>
          <p className="text-slate-500 text-sm">Acesse para continuar</p>
        </div>
        <div className="space-y-3">
          <button onClick={() => signIn("google")}
            className="w-full h-11 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium">
            Entrar com Google
          </button>
          <button onClick={() => signIn("azure-ad")}
            className="w-full h-11 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium">
            Entrar com Microsoft
          </button>
          <button onClick={() => signIn("email", { email: prompt("Seu email:") || undefined })}
            className="w-full h-11 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium">
            Entrar com Link por Email
          </button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-slate-400">ou</span>
          </div>
        </div>
        <form className="space-y-3" onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget as HTMLFormElement;
          const email = (form.elements.namedItem("email") as HTMLInputElement).value;
          const password = (form.elements.namedItem("password") as HTMLInputElement).value;
          await signIn("credentials", { email, password, callbackUrl: "/" });
        }}>
          <input name="email" type="email" placeholder="Email" className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          <input name="password" type="password" placeholder="Senha" className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          <button type="submit" className="w-full h-11 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium">Entrar</button>
        </form>
      </div>
    </div>
  );
}


