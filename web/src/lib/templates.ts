export function appointmentConfirmation(params: {
  patientName?: string | null;
  doctorName?: string | null;
  startsAtISO: string;
  mode: "IN_PERSON" | "ONLINE";
  meetingUrl?: string | null;
}) {
  const date = new Date(params.startsAtISO).toLocaleString("pt-BR");
  const subject = `Confirmação de consulta - ${date}`;
  const html = `
  <div style="font-family:Arial,sans-serif;color:#0f172a">
    <h2 style="color:#0ea5a4;margin:0 0 8px">MediSync</h2>
    <p>Olá ${params.patientName || ""}, sua consulta foi agendada.</p>
    <ul>
      <li><strong>Médico:</strong> ${params.doctorName || ""}</li>
      <li><strong>Data e Hora:</strong> ${date}</li>
      <li><strong>Modo:</strong> ${params.mode === "ONLINE" ? "Online" : "Presencial"}</li>
      ${params.meetingUrl ? `<li><strong>Link:</strong> <a href="${params.meetingUrl}">${params.meetingUrl}</a></li>` : ""}
    </ul>
  </div>`;
  const text = `MediSync\n\nConsulta confirmada com ${params.doctorName || ""} em ${date}. Modo: ${params.mode}. ${params.meetingUrl ? "Link: " + params.meetingUrl : ""}`;
  return { subject, html, text };
}

export function appointmentReminder(params: { patientName?: string | null; startsAtISO: string }) {
  const date = new Date(params.startsAtISO).toLocaleString("pt-BR");
  const subject = `Lembrete: consulta em ${date}`;
  const html = `<p>Olá ${params.patientName || ""}, lembrete da sua consulta em ${date}.</p>`;
  const text = `Lembrete de consulta em ${date}.`;
  return { subject, html, text };
}

export function examPreparation(params: { procedure: string; bullets: string[] }) {
  const subject = `Preparo para ${params.procedure}`;
  const items = params.bullets.map((b) => `<li>${b}</li>`).join("");
  const html = `<div><p>Instruções de preparo:</p><ul>${items}</ul></div>`;
  const text = `Instruções:\n- ${params.bullets.join("\n- ")}`;
  return { subject, html, text };
}


