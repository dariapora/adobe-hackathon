import './App.css'
import '@mantine/core/styles.css'
import { createTheme, MantineProvider } from '@mantine/core'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header.jsx'

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
  '#2c4b80',
]

const theme = createTheme({
  colors: { checkin },
  primaryColor: 'checkin',
})

function App() {
  return (
    <MantineProvider theme={theme}>
      <Routes>
        <Route path="/" element={<Header />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </MantineProvider>
  )
}

export default App
