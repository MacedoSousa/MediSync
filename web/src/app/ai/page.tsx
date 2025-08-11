"use client";
import { useState } from "react";

export default function AIPage() {
  const [symptoms, setSymptoms] = useState("");
  const [triage, setTriage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setTriage("");
    const res = await fetch("/api/ai/triage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ symptoms }) });
    const data = await res.json();
    setTriage(data.triage || JSON.stringify(data));
    setLoading(false);
  }

  return (
    <main className="max-w-3xl mx-auto p-6 grid gap-4">
      <h1 className="text-xl font-semibold text-slate-800">IA – Triagem</h1>
      <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} className="w-full min-h-[120px] p-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Descreva seus sintomas" />
      <button onClick={submit} disabled={loading} className="h-11 w-full md:w-auto px-6 rounded-lg bg-teal-600 hover:bg-teal-700 text-white">
        {loading ? "Analisando..." : "Triar"}
      </button>
      {triage && (
        <div className="rounded-lg bg-white/70 backdrop-blur border p-4 whitespace-pre-wrap">{triage}</div>
      )}
    </main>
  );
}



