import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Header from './components/Header'
import Hero from './components/Hero'
import ServiceForm from './components/ServiceForm'
import UserDashboard from './components/UserDashboard'
import OrdersPage from './pages/OrdersPage'
import Footer from './components/Footer'

// 导入主题和全局样式
import theme from './styles/theme'
import './styles/globalStyles.css'



function App() {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <div className="grid-background">
            <Header />
            <Routes>
              <Route path="/" element={
                <React.Fragment>
                  <Hero />
                  <ServiceForm />
                </React.Fragment>
              } />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/service" element={<ServiceForm />} />
            </Routes>
            <Footer />
          </div>
        </div>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

export default App
