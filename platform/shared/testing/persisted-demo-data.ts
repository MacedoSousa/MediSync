import type { AppointmentStatus } from "../confirmed-appointment";
import type { SyntheticHealthAssetType } from "../synthetic-health-asset";

export type PersistedDemoAppointment = Readonly<{
  sourceId: string;
  status: AppointmentStatus;
  startsAt: Date;
  timezone: string;
  location: string;
  professionalLabel: string;
  preparationInstructions: string;
  cancelledAt?: Date;
}>;

export type PersistedDemoAsset = Readonly<{
  assetType: SyntheticHealthAssetType;
  assetCode: string;
  title: string;
  summary: string;
  occurredAt: Date;
  storageObjectKey?: string;
}>;

const nonDiagnosticNotice = "Conteúdo sintético, não diagnóstico e exclusivo para demonstração do MedSync.";

/** Dados estritamente simulados: cada item tem uma chave estável para upsert por paciente. */
export function createPersistedDemoAppointments(): readonly PersistedDemoAppointment[] {
  return [
    {
      sourceId: "demo-agenda-cardiologia-001",
      status: "confirmed",
      startsAt: new Date("2026-09-03T13:30:00.000Z"),
      timezone: "America/Sao_Paulo",
      location: "Unidade demonstrativa Centro",
      professionalLabel: "Profissional demonstrativo — Clínica médica",
      preparationInstructions: "Exemplo demonstrativo de chegada antecipada. Dados exclusivamente demonstrativos.",
    },
    {
      sourceId: "demo-agenda-exame-002",
      status: "confirmed",
      startsAt: new Date("2026-09-09T12:00:00.000Z"),
      timezone: "America/Sao_Paulo",
      location: "Laboratório demonstrativo Norte",
      professionalLabel: "Coleta demonstrativa",
      preparationInstructions: "Preparação demonstrativa: siga somente orientações reais da unidade responsável, sem orientação clínica neste exemplo.",
    },
    {
      sourceId: "demo-agenda-retorno-003",
      status: "confirmed",
      startsAt: new Date("2026-09-16T16:00:00.000Z"),
      timezone: "America/Sao_Paulo",
      location: "Teleatendimento demonstrativo",
      professionalLabel: "Profissional demonstrativo — Retorno",
      preparationInstructions: "Exemplo demonstrativo de identificação disponível. Registro de demonstração.",
    },
    {
      sourceId: "demo-agenda-cancelada-004",
      status: "cancelled",
      startsAt: new Date("2026-08-04T14:00:00.000Z"),
      timezone: "America/Sao_Paulo",
      location: "Unidade demonstrativa Leste",
      professionalLabel: "Consulta demonstrativa cancelada",
      preparationInstructions: "Registro demonstrativo mantido apenas para exibir o status cancelado.",
      cancelledAt: new Date("2026-08-03T15:00:00.000Z"),
    },
  ] as const;
}

export function createPersistedDemoAssets(): readonly PersistedDemoAsset[] {
  return [
    {
      assetType: "exam_result",
      assetCode: "demo-laboratory-result",
      title: "Resultado laboratorial ilustrativo",
      summary: `Painel visual de resultado fictício. ${nonDiagnosticNotice}`,
      occurredAt: new Date("2026-08-11T10:00:00.000Z"),
      storageObjectKey: "/manus-storage/medsync-demo-lab-result_18ad81ce.png",
    },
    {
      assetType: "radiology_image",
      assetCode: "demo-radiology-placeholder",
      title: "Imagem radiológica ilustrativa",
      summary: `Imagem abstrata sem anatomia real. ${nonDiagnosticNotice}`,
      occurredAt: new Date("2026-08-09T14:00:00.000Z"),
      storageObjectKey: "/manus-storage/medsync-demo-radiology_23496923.png",
    },
    {
      assetType: "document",
      assetCode: "demo-exam-document",
      title: "Documento de exame ilustrativo",
      summary: `Documento visual com dados fictícios. ${nonDiagnosticNotice}`,
      occurredAt: new Date("2026-08-08T11:00:00.000Z"),
      storageObjectKey: "/manus-storage/medsync-demo-exam-document_79133f07.png",
    },
    {
      assetType: "exam_result",
      assetCode: "demo-vital-signs-result",
      title: "Registro ilustrativo de acompanhamento",
      summary: `Linha de dados simulados para validação visual. ${nonDiagnosticNotice}`,
      occurredAt: new Date("2026-07-28T09:00:00.000Z"),
    },
    {
      assetType: "document",
      assetCode: "demo-discharge-summary",
      title: "Resumo de atendimento ilustrativo",
      summary: `Modelo de documento sem pessoa ou caso clínico real. ${nonDiagnosticNotice}`,
      occurredAt: new Date("2026-07-20T13:00:00.000Z"),
    },
    {
      assetType: "radiology_image",
      assetCode: "demo-imaging-comparison",
      title: "Comparativo visual ilustrativo",
      summary: `Composição gráfica abstrata para testar a galeria. ${nonDiagnosticNotice}`,
      occurredAt: new Date("2026-07-15T15:30:00.000Z"),
    },
  ] as const;
}
