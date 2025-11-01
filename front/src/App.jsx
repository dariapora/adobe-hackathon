import './App.css'
import '@mantine/core/styles.css'
import { createTheme, MantineProvider } from '@mantine/core'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header.jsx'
import Login from './components/Login.jsx'
import Onboarding from './components/Onboarding.jsx'
import Profile from './components/Profile.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

const checkin = [
  '#eef0f9', // 0 - lightest tint
  '#e3e6f5', // 1
  '#d6dbef', // 2
  '#c8cfe7', // 3
  '#b8c2df', // 4
  '#99A0CA', // 5 - provided palette (light)
  '#5C69AC', // 6 - provided palette (primary)
  '#4C5897', // 7 - provided palette (dark)
  '#414c88', // 8 - between 7 and 9
  '#36437A', // 9 - provided palette (darkest)
]

const theme = createTheme({
  colors: { checkin },
  primaryColor: 'checkin',
})

function App() {
  return (
    <MantineProvider theme={theme}>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <Header />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MantineProvider>
  )
}

export default App
