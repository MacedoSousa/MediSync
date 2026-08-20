export const PROTOTYPE_PORTAL_ROLE_IDS = [
  "patient",
  "caregiver",
  "professional",
  "organization",
  "pharmacy",
  "operator",
  "regulation",
  "administration",
] as const;

export type PrototypePortalRole = (typeof PROTOTYPE_PORTAL_ROLE_IDS)[number];

export interface PrototypePortal {
  id: PrototypePortalRole;
  label: string;
  description: string;
  scope: readonly string[];
  isSynthetic: true;
  externalActionsBlocked: true;
  blockedMessage: string;
}

const BLOCKED_MESSAGE =
  "Demonstração MedSync: nenhuma ação externa, acesso institucional ou decisão real está disponível neste portal.";

export const PROTOTYPE_PORTAL_ROLES: readonly PrototypePortal[] = [
  {
    id: "patient",
    label: "Paciente",
    description: "Visualiza o próprio cenário demonstrativo e seus controles de privacidade.",
    scope: ["Histórico sintético autorizado", "Agenda demonstrativa", "Preferências e consentimentos ilustrativos"],
    isSynthetic: true,
    externalActionsBlocked: true,
    blockedMessage: BLOCKED_MESSAGE,
  },
  {
    id: "caregiver",
    label: "Cuidador",
    description: "Consulta apenas rotinas ilustrativas sob escopo mínimo demonstrativo.",
    scope: ["Rotina de cuidado ilustrativa", "Lembretes demonstrativos", "Contatos previamente simulados"],
    isSynthetic: true,
    externalActionsBlocked: true,
    blockedMessage: BLOCKED_MESSAGE,
  },
  {
    id: "professional",
    label: "Profissional",
    description: "Visualiza solicitações e disponibilidade simuladas, sem prontuário real.",
    scope: ["Fila de solicitações fictícias", "Disponibilidade declarada ilustrativa", "Sinalização de origem simulada"],
    isSynthetic: true,
    externalActionsBlocked: true,
    blockedMessage: BLOCKED_MESSAGE,
  },
  {
    id: "organization",
    label: "Organização de saúde",
    description: "Explora uma visão institucional simulada com capacidade e agenda fictícias.",
    scope: ["Painel de agenda sintética", "Fila institucional ilustrativa", "Indicadores agregados simulados"],
    isSynthetic: true,
    externalActionsBlocked: true,
    blockedMessage: BLOCKED_MESSAGE,
  },
  {
    id: "pharmacy",
    label: "Farmácia",
    description: "Exibe catálogo e benefícios ilustrativos sem venda ou dispensação.",
    scope: ["Ofertas ilustrativas", "Catálogo sintético", "Vigências demonstrativas"],
    isSynthetic: true,
    externalActionsBlocked: true,
    blockedMessage: BLOCKED_MESSAGE,
  },
  {
    id: "operator",
    label: "Operadora",
    description: "Exibe estados de cobertura demonstrativos sem elegibilidade real.",
    scope: ["Cobertura ilustrativa", "Benefícios sintéticos", "Regras de vigência demonstrativas"],
    isSynthetic: true,
    externalActionsBlocked: true,
    blockedMessage: BLOCKED_MESSAGE,
  },
  {
    id: "regulation",
    label: "Regulação",
    description: "Apresenta capacidade e prioridade simuladas, sempre dependentes de decisão humana.",
    scope: ["Capacidade fictícia", "Critérios de visualização ilustrativos", "Registro de decisão humana simulada"],
    isSynthetic: true,
    externalActionsBlocked: true,
    blockedMessage: BLOCKED_MESSAGE,
  },
  {
    id: "administration",
    label: "Administração",
    description: "Revisa governança, trilhas e métricas agregadas de demonstração.",
    scope: ["Governança assistiva", "Métricas agregadas", "Auditoria demonstrativa"],
    isSynthetic: true,
    externalActionsBlocked: true,
    blockedMessage: BLOCKED_MESSAGE,
  },
] as const;

export function isPrototypePortalRole(value: string): value is PrototypePortalRole {
  return (PROTOTYPE_PORTAL_ROLE_IDS as readonly string[]).includes(value);
}

export function getPrototypePortal(role: PrototypePortalRole): PrototypePortal {
  const portal = PROTOTYPE_PORTAL_ROLES.find((candidate) => candidate.id === role);
  if (!portal) {
    throw new Error(`Papel demonstrativo não encontrado: ${role}`);
  }
  return portal;
}
