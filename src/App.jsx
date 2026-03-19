import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import AgencyDashboard from '@/pages/AgencyDashboard'
import ConferencesPage from '@/pages/ConferencesPage'
import ConferenceDetailPage from '@/pages/ConferenceDetailPage'
import ProjectDetailPage from '@/pages/ProjectDetailPage'
import KanbanPage from '@/pages/KanbanPage'
import CostManagementPage from '@/pages/CostManagementPage'
import RequestsPage from '@/pages/RequestsPage'
import GanttPage from '@/pages/GanttPage'
import BrandAssetsPage from '@/pages/BrandAssetsPage'
import UserManagementPage from '@/pages/UserManagementPage'
// AgencyManagementPage removed - agencies managed via Users page

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

function DashboardRouter() {
  const { profile } = useAuth()
  if (profile?.role === 'agency') return <AgencyDashboard />
  return <DashboardPage />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardRouter />} />
              <Route path="/conferences" element={<ConferencesPage />} />
              <Route path="/conferences/:id" element={<ConferenceDetailPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/requests" element={<RequestsPage />} />
              <Route path="/kanban" element={<KanbanPage />} />
              <Route path="/gantt" element={<GanttPage />} />
              <Route path="/costs" element={<CostManagementPage />} />
              <Route path="/brand-assets" element={<BrandAssetsPage />} />
              <Route path="/users" element={<UserManagementPage />} />
              {/* Agencies page removed - managed via Users */}
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
