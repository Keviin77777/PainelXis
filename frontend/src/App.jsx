import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Lines from './pages/Lines'
import Users from './pages/Users'
import Settings from './pages/Settings'
import Notices from './pages/Notices'
import Tickets from './pages/Tickets'
import BuyCredits from './pages/BuyCredits'
import Profile from './pages/Profile'
import Security from './pages/Security'
import Sessions from './pages/Sessions'
import Clients from './pages/Clients'
import Servers from './pages/Servers'
import LiveConnections from './pages/LiveConnections'
import Plans from './pages/Plans'
import Layout from './components/Layout'
import NotificationToast from './components/NotificationToast'

function PrivateRoute({ children }) {
  const { token } = useAuthStore()
  return token ? children : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter>
      <NotificationToast />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="notices" element={<Notices />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="buy-credits" element={<BuyCredits />} />
          <Route path="profile" element={<Profile />} />
          <Route path="security" element={<Security />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="clients" element={<Clients />} />
          <Route path="servers" element={<Servers />} />
          <Route path="live-connections" element={<LiveConnections />} />
          <Route path="plans" element={<Plans />} />
          <Route path="lines" element={<Lines />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
