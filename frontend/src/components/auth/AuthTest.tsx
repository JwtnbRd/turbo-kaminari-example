import React, { useState } from 'react';
import { authService } from '../../services/auth';

export const AuthTest: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

  const handleRegister = async () => {
    try {
      const response = await authService.register({
        email,
        password,
        password_confirmation: password,
        username
      });
      setMessage(`登録成功: ${response.message}`);
      setIsAuthenticated(true);
    } catch (error: any) {
      setMessage(`登録失敗: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await authService.login({ email, password });
      setMessage(`ログイン成功: ${response.message}`);
      setIsAuthenticated(true);
    } catch (error: any) {
      setMessage(`ログイン失敗: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setMessage('ログアウト成功');
      setIsAuthenticated(false);
    } catch (error: any) {
      setMessage(`ログアウト失敗: ${error.message}`);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">認証テスト</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            メールアドレス:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            パスワード:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            ユーザー名:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleRegister}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            ユーザー登録
          </button>

          <button
            onClick={handleLogin}
            className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            ログイン
          </button>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              ログアウト
            </button>
          )}
        </div>

        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm">
            認証状態: {isAuthenticated ? '認証済み' : '未認証'}
          </p>
          {message && (
            <p className="text-sm mt-2 text-blue-600">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};