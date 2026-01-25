import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/auth';

export const useUserSessions = (userId?: string) => {
  return useQuery({
    queryKey: ['user-sessions', userId],
    queryFn: async () => {
      if (!userId) return { sessions: [], total: 0 };
      const res = await authService.getUserSessions(userId);
      
      return res;
    },
    enabled: !!userId,
  });
};