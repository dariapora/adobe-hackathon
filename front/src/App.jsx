import './App.css'
import '@mantine/core/styles.css'
import { createTheme, MantineProvider } from '@mantine/core'
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
      <Header />
    </MantineProvider>
  )
}

export default App
