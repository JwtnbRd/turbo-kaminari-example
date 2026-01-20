import api from './api';
import type { User } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

interface RegisterCredentials {
  email: string;
  password: string;
  password_confirmation: string;
  username: string;
}

interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

// JWTトークンを管理するローカルストレージ
const TOKEN_KEY = 'auth_token';

export const authService = {
  // トークンの取得
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // トークンの保存
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // トークンの削除
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  // ログイン
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/sign_in', {
      user: credentials
    });

    if (response.data.token) {
      authService.setToken(response.data.token);
    }

    return response.data;
  },

  // ユーザー登録
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/sign_up', {
      user: credentials
    });

    if (response.data.token) {
      authService.setToken(response.data.token);
    }

    return response.data;
  },

  // ログアウト
  logout: async (): Promise<void> => {
    try {
      await api.delete('/auth/sign_out');
    } finally {
      authService.removeToken();
    }
  },

  // 認証状態の確認
  isAuthenticated: (): boolean => {
    return !!authService.getToken();
  },

  // 現在のユーザー情報取得
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data.user;
  }
};