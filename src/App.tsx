import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Schedule from './pages/Schedule'
import DetailShooting from './pages/DetailShooting'
import FormShooting from './pages/FormShooting'
import Crew from './pages/Crew'
import Equipment from './pages/Equipment'
import Projects from './pages/Projects'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <Schedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shooting/baru"
          element={
            <ProtectedRoute adminOnly>
              <FormShooting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shooting/:id"
          element={
            <ProtectedRoute>
              <DetailShooting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shooting/:id/edit"
          element={
            <ProtectedRoute adminOnly>
              <FormShooting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crew"
          element={
            <ProtectedRoute>
              <Crew />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipment"
          element={
            <ProtectedRoute>
              <Equipment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}
