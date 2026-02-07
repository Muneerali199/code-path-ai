import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './hooks/useAuth.tsx'
import { Toaster } from './components/ui/sonner.tsx'
import PageLoader from './components/ui/PageLoader.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'

// ── Lazy-loaded pages (code-split into separate chunks) ──────
const LandingPage = lazy(() => import('./LandingPage.tsx'))
const Auth = lazy(() => import('./pages/Auth.tsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.tsx'))
const EditorPage = lazy(() => import('./pages/EditorPage.tsx'))
const DocsPage = lazy(() => import('./pages/DocsPage.tsx'))
const ProfilePage = lazy(() => import('./pages/ProfilePage.tsx'))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })))
const SessionView = lazy(() => import('./pages/SessionView.tsx'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />

            {/* Protected routes — redirect to /auth when not logged in */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/editor" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
            <Route path="/editor/:projectId" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
            <Route path="/app" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

            <Route path="/docs" element={<DocsPage />} />
            <Route path="/session/:sessionId" element={<SessionView />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster richColors position="top-center" />
    </AuthProvider>
  </StrictMode>,
)
