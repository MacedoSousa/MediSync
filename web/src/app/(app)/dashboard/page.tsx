import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
type Role = "ADMIN" | "DOCTOR" | "PATIENT" | "PHARMACY_ADMIN";
import Link from "next/link";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: Role })?.role;
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-8">
      <section className="max-w-5xl mx-auto grid gap-6">
        <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
        {!session?.user && (
          <div className="rounded-xl bg-white border p-6">Faça login para acessar.</div>
        )}
        {session?.user && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {role === "PATIENT" && (
              <div className="rounded-xl bg-white border p-6">
                <h2 className="font-medium mb-2">Paciente</h2>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li><Link href="/api/appointments">Minhas consultas (API)</Link></li>
                  <li><Link href="/api/ai/triage">Triagem IA (API)</Link></li>
                </ul>
              </div>
            )}
            {role === "DOCTOR" && (
              <div className="rounded-xl bg-white border p-6">
                <h2 className="font-medium mb-2">Médico</h2>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li><Link href="/api/availability">Meus horários (API)</Link></li>
                  <li><Link href="/api/doctors">Perfil (API)</Link></li>
                </ul>
              </div>
            )}
            {(role === "ADMIN" || role === "PHARMACY_ADMIN") && (
              <div className="rounded-xl bg-white border p-6">
                <h2 className="font-medium mb-2">Admin</h2>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li><Link href="/api/facilities">Unidades (API)</Link></li>
                  <li><Link href="/api/notify/queue">Fila de Notificação (API)</Link></li>
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}


