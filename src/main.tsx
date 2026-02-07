import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import LandingPage from './LandingPage.tsx'
import Auth from './pages/Auth.tsx'
import Dashboard from './pages/Dashboard.tsx'
import DocsPage from './pages/DocsPage.tsx'
import { AuthProvider } from './hooks/useAuth.tsx'
import { Toaster } from './components/ui/sonner.tsx'
import EditorPage from './pages/EditorPage.tsx'
import ProfilePage from './pages/ProfilePage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/editor/:projectId" element={<EditorPage />} />
          <Route path="/app" element={<EditorPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-center" />
    </AuthProvider>
  </StrictMode>,
)
