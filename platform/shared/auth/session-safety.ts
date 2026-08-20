export interface SessionIdentity {
  id: number;
  openId: string;
}

/**
 * A identidade em cache nunca é suficiente por si só para autenticar o usuário
 * em um dispositivo móvel. Ela só pode ser exposta quando acompanha um token de
 * sessão armazenado no repositório seguro do sistema operacional.
 */
export function hasValidNativeSession(
  sessionToken: string | null,
  cachedIdentity: SessionIdentity | null,
): cachedIdentity is SessionIdentity {
  return Boolean(sessionToken && cachedIdentity);
}
