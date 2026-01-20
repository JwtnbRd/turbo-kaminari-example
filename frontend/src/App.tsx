import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ApiTest from './components/ApiTest'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { TrainingManagement } from './pages/admin/TrainingManagement'
import TrainingApp from './pages/TrainingApp'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TrainingApp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/training-management" element={<TrainingManagement />} />
        <Route path="/api-test" element={<ApiTest />} />
      </Routes>
    </Router>
  )
}

export default App