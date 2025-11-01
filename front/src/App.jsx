import './App.css'
import '@mantine/core/styles.css';
import { createTheme, MantineProvider } from '@mantine/core';
import Login from './components/Login.jsx';
import { Chat } from './components/Chat'
import { useState } from 'react'

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

function App() {
  const [user, setUser] = useState(null)

  const handleLogin = (profile) => {
    // profile contains firstName, lastName, role, teamId
    setUser(profile)
  }



  return (
    <MantineProvider theme={theme}>
      {user ? (
        <Chat />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </MantineProvider>
  )
}

export default App
