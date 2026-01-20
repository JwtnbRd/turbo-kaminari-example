import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  });

  // ログイン
  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await authService.login({ email, password });
      setState(prev => ({
        ...prev,
        user: response.user,
        isAuthenticated: true,
        loading: false,
      }));
      return true;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.response?.data?.error || 'ログインに失敗しました',
        loading: false,
      }));
      return false;
    }
  }, []);

  // ログアウト
  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      await authService.logout();
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    }
  }, []);

  // 認証状態初期化
  useEffect(() => {
    const initAuth = async () => {
      const isAuthenticated = authService.isAuthenticated();

      if (isAuthenticated) {
        try {
          const user = await authService.getCurrentUser();
          setState({
            user,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
        } catch (error) {
          // トークンが無効な場合はログアウト
          authService.removeToken();
          setState({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          });
        }
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    initAuth();
  }, []);

  return {
    ...state,
    login,
    logout,
    clearError: () => setState(prev => ({ ...prev, error: null })),
  };
};