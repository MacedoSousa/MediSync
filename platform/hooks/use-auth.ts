import * as Api from "@/lib/_core/api";
import * as Auth from "@/lib/_core/auth";
import { hasValidNativeSession } from "@/shared/auth/session-safety";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

type UseAuthOptions = {
  autoFetch?: boolean;
};

export function useAuth(options?: UseAuthOptions) {
  const { autoFetch = true } = options ?? {};
  const [user, setUser] = useState<Auth.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (Platform.OS === "web") {
        const apiUser = await Api.getMe();
        if (!apiUser) {
          setUser(null);
          await Auth.clearUserInfo();
          return;
        }

        const userInfo: Auth.User = {
          id: apiUser.id,
          openId: apiUser.openId,
          role: apiUser.role,
          name: apiUser.name,
          email: apiUser.email,
          loginMethod: apiUser.loginMethod,
          lastSignedIn: new Date(apiUser.lastSignedIn),
        };
        setUser(userInfo);
        await Auth.setUserInfo(userInfo);
        return;
      }

      const [sessionToken, cachedUser] = await Promise.all([
        Auth.getSessionToken(),
        Auth.getUserInfo(),
      ]);

      if (!hasValidNativeSession(sessionToken, cachedUser)) {
        await Auth.removeSessionToken();
        await Auth.clearUserInfo();
        setUser(null);
        return;
      }

      setUser(cachedUser);
    } catch (reason) {
      setUser(null);
      setError(reason instanceof Error ? reason : new Error("Não foi possível verificar a sessão."));
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await Api.logout();
    } finally {
      await Auth.removeSessionToken();
      await Auth.clearUserInfo();
      setUser(null);
      setError(null);
    }
  }, []);

  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  useEffect(() => {
    if (autoFetch) {
      void fetchUser();
    } else {
      setLoading(false);
    }
  }, [autoFetch, fetchUser]);

  return { user, loading, error, isAuthenticated, refresh: fetchUser, logout };
}
