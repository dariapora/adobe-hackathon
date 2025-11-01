import './App.css'
import '@mantine/core/styles.css';
import { createTheme, MantineProvider } from '@mantine/core';
import Login from './components/Login.jsx';
import MantineSocialFeed from './components/Home'
import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Chat } from './components/Chat.jsx'

const checkin = [
  '#ecf4ff',
  '#dce4f5',
  '#b9c7e2',
  '#94a8d0',
  '#748dc0',
  '#5f7cb7',
  '#5474b4',
  '#44639f',
  '#3a5890',
  '#2c4b80'
];

const theme = createTheme({
  colors: {
    checkin,
  },
  primaryColor: 'checkin',
});

function PrivateRoute({ children, isAuthed }) {
  return isAuthed ? children : <Navigate to="/login" replace />
}

function App() {
  const [user, setUser] = useState(null)

  const handleLogin = (profile) => {
    // profile contains firstName, lastName, role, teamId
    setUser(profile)
  }

  return (
    <MantineProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route
            path="/home"
            element={
              <PrivateRoute isAuthed={Boolean(user)}>
                <MantineSocialFeed />
              </PrivateRoute>
            }
          />
          <Route
            path="/team-chat"
            element={
              <PrivateRoute isAuthed={Boolean(user)}>
                {/* Full-page team chat using the same component */}
                <div style={{ padding: 16 }}>
                  <Chat floating={false} height={700} />
                </div>
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <FloatingChatGuard />
      </BrowserRouter>
    </MantineProvider>
  )
}

export default App

function FloatingChatGuard() {
  const location = useLocation()
  const showFloating = location.pathname === '/home'
  if (!showFloating) return null
  return <Chat floating height={500} />
}
