import { createContext, useContext } from "react";

export type AuthContextValue = {
  accessToken: string;
  userId: string;
  initialSymbols: string[];
  saveWatchlist: (symbols: string[]) => Promise<void>;
  signOut: () => Promise<void>;
  userEmail: string;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useApeAuth() {
  return useContext(AuthContext);
}
