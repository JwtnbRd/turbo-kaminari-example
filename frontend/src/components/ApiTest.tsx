import { useState, useEffect } from 'react'

interface BackendResponse {
  status: string
  message: string
  timestamp: string
}

export default function ApiTest() {
  const [response, setResponse] = useState<BackendResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testApiConnection = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch('http://localhost:3001/api/health')

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data: BackendResponse = await res.json()
      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testApiConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          API Connection Test
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Frontend → Backend Communication
          </h2>

          <div className="space-y-4">
            <div>
              <span className="font-medium">Frontend URL:</span>
              <span className="ml-2 text-blue-600">http://localhost:3000</span>
            </div>
            <div>
              <span className="font-medium">Backend API URL:</span>
              <span className="ml-2 text-green-600">http://localhost:3001/api/health</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Connection Status</h3>
            <button
              onClick={testApiConnection}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Again'}
            </button>
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Connecting to backend...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <h4 className="font-semibold text-red-800 mb-2">Connection Failed</h4>
              <p className="text-red-600">{error}</p>
              <div className="mt-4 text-sm text-red-700">
                <p><strong>Possible causes:</strong></p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Backend server is not running</li>
                  <li>CORS configuration issue</li>
                  <li>Network connectivity problem</li>
                  <li>Port mismatch</li>
                </ul>
              </div>
            </div>
          )}

          {response && (
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <h4 className="font-semibold text-green-800 mb-2">✅ Connection Successful!</h4>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-green-700">Status:</span>
                  <span className="ml-2 text-green-600">{response.status}</span>
                </div>
                <div>
                  <span className="font-medium text-green-700">Message:</span>
                  <span className="ml-2 text-green-600">{response.message}</span>
                </div>
                <div>
                  <span className="font-medium text-green-700">Timestamp:</span>
                  <span className="ml-2 text-green-600">{response.timestamp}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Tech Stack</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Frontend:</strong> Vite + React 19.2.0 + TypeScript + Tailwind CSS</p>
            <p><strong>Backend:</strong> Ruby on Rails 8.0.2 + PostgreSQL + Redis</p>
            <p><strong>DevContainer:</strong> Docker-in-Docker environment with volume mounting</p>
            <p><strong>CORS:</strong> rack-cors gem configured for localhost:3000</p>
          </div>
        </div>
      </div>
    </div>
  )
}