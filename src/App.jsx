import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material'
import Header from './components/Header'
import Hero from './components/Hero'
import ServiceForm from './components/ServiceForm'
import UserDashboard from './components/UserDashboard'
import OrdersPage from './pages/OrdersPage'
import AdminPanel from './pages/AdminPanel'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

// 导入用户管理工具
import { userManager } from './utils/dataManager'

// 导入调试工具
import { printLocalStorage, resetLocalStorage, addAdminUser, loginAsAdmin } from './utils/debugHelper'

// 导入主题和全局样式
import theme from './styles/theme'
import './styles/globalStyles.css'



function App() {
  const [debugDialogOpen, setDebugDialogOpen] = useState(false);
  const [debugMessage, setDebugMessage] = useState('');

  // 处理打印 localStorage 数据
  const handlePrintLocalStorage = () => {
    printLocalStorage();
    setDebugMessage('数据已打印到控制台，请打开浏览器控制台查看');
  };

  // 处理重置 localStorage 数据
  const handleResetLocalStorage = () => {
    resetLocalStorage();
    setDebugMessage('localStorage 已清空，请刷新页面');
  };

  // 处理添加管理员用户
  const handleAddAdminUser = () => {
    const result = addAdminUser();
    setDebugMessage(result);
  };

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
              <Route path="/admin" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminPanel />
                </ProtectedRoute>
              } />
            </Routes>
            <Footer />

            {/* 调试按钮 */}
            <Box
              sx={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => setDebugDialogOpen(true)}
                sx={{ opacity: 0.7 }}
              >
                调试工具
              </Button>
            </Box>

            {/* 调试对话框 */}
            <Dialog open={debugDialogOpen} onClose={() => setDebugDialogOpen(false)}>
              <DialogTitle>调试工具</DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 2 }}>
                  <Button variant="outlined" onClick={handlePrintLocalStorage}>
                    打印 localStorage 数据
                  </Button>
                  <Button variant="outlined" onClick={handleAddAdminUser}>
                    添加管理员用户
                  </Button>
                  <Button variant="contained" color="primary" onClick={() => {
                    const result = loginAsAdmin();
                    setDebugMessage(result);
                  }}>
                    直接登录为管理员
                  </Button>
                  <Button variant="outlined" color="error" onClick={handleResetLocalStorage}>
                    重置所有数据
                  </Button>
                </Box>

                {debugMessage && (
                  <Typography variant="body2" sx={{ mt: 2, p: 2, bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 1 }}>
                    {debugMessage}
                  </Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDebugDialogOpen(false)}>关闭</Button>
              </DialogActions>
            </Dialog>
          </div>
        </div>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

export default App
