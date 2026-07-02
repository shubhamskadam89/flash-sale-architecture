import { createContext } from "react";
import type { AuthenticatedUser } from "../api/contracts";

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthContextValue = {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<AuthenticatedUser>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
