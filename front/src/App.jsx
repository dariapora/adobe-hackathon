import './App.css'
import '@mantine/core/styles.css';
import { Auth } from "./components/Auth.jsx";
import { Home } from "./components/Home.jsx";
import { createTheme, MantineProvider } from '@mantine/core';

const theme = createTheme({
  /** Put your mantine theme override here */
});

function App() {

  return (
    <MantineProvider theme={theme}>
      <Auth/>
    </MantineProvider>
  )
}

export default App
