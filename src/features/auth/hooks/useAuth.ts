import { useAuthContext, type AuthContextValue } from './useAuthContext';

export const useAuth = (): AuthContextValue => {
  return useAuthContext();
};
