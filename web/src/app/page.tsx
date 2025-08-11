export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-8">
      <section className="max-w-4xl mx-auto grid gap-6">
        <h1 className="text-3xl font-semibold text-slate-800">MediSync</h1>
        <p className="text-slate-600">Integração de médicos, pacientes e farmácias com foco em segurança, privacidade e IA.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
            <h2 className="font-medium text-slate-800 mb-2">Pacientes</h2>
            <p className="text-sm text-slate-600">Triagem com IA, agendamento, receitas e exames.</p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
            <h2 className="font-medium text-slate-800 mb-2">Médicos</h2>
            <p className="text-sm text-slate-600">Agenda, disponibilidade, resumos de consulta por IA.</p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
            <h2 className="font-medium text-slate-800 mb-2">Farmácias</h2>
            <p className="text-sm text-slate-600">Acesso autorizado a prescrições e orientações.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
