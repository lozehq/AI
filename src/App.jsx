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
import NotificationsPage from './pages/NotificationsPage'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import OfflineIndicator from './components/OfflineIndicator'

// 导入认证上下文
import { AuthProvider } from './contexts/AuthContext'
import { ErrorProvider } from './contexts/ErrorContext'

// 导入用户管理工具
import { userManager } from './utils/dataManager'

// 导入调试工具
import { printLocalStorage, resetLocalStorage, addAdminUser, loginAsAdmin } from './utils/debugHelper'

// 导入紧急重置工具
import { emergencyReset } from './utils/emergencyReset'

// 导入状态验证工具
import { validateAppState } from './utils/stateValidator'

// 导入认证状态修复工具
import { autoFixAuthState } from './utils/authFixer'

// 导入主题和全局样式
import theme from './styles/theme'
import './styles/globalStyles.css'



function App() {
  const [debugDialogOpen, setDebugDialogOpen] = useState(false);
  const [debugMessage, setDebugMessage] = useState('');
  const [stateValidated, setStateValidated] = useState(false);

  // 在组件挂载时验证应用状态
  React.useEffect(() => {
    const validateState = async () => {
      try {
        console.log('应用启动时验证状态...');

        // 先修复认证状态
        const authFixed = autoFixAuthState();
        if (authFixed) {
          console.log('认证状态已修复');
        }

        // 然后验证应用状态
        const isValid = await validateAppState();
        setStateValidated(true);

        // 如果状态无效，显示提示
        if (!isValid) {
          console.warn('应用状态验证失败，已尝试修复');
          // 可以在这里添加提示或其他操作
        }

        // 检查 URL 参数
        const urlParams = new URLSearchParams(window.location.search);

        // 如果有 reset=true，则清除参数
        if (urlParams.has('reset')) {
          // 清除 URL 参数，但不刷新页面
          const newUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, newUrl);
        }

        // 如果有 login=true 参数，则触发登录对话框
        if (urlParams.has('login')) {
          // 设置全局变量，通知 Header 组件打开登录对话框
          window.shouldOpenAuthDialog = true;

          // 清除 URL 参数，但不刷新页面
          const newUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, newUrl);
        }
      } catch (error) {
        console.error('状态验证过程中发生错误:', error);
      }
    };

    validateState();
  }, []);

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
    <ErrorProvider>
      <AuthProvider>
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
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } />
              <Route path="/orders" element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              } />
              <Route path="/service" element={<ServiceForm />} />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute adminOnly={true}>
                  <AdminPanel />
                </ProtectedRoute>
              } />
            </Routes>
            <Footer />

            {/* 离线模式指示器 */}
            <OfflineIndicator />

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
                sx={{ opacity: 0.7, mb: 1 }}
              >
                调试工具
              </Button>

              {/* 紧急重置按钮 */}
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => {
                  if (window.confirm('确定要执行紧急重置吗？这将清除所有本地数据并重新加载页面。')) {
                    emergencyReset();
                  }
                }}
                sx={{ opacity: 0.7, mb: 1 }}
              >
                紧急重置
              </Button>

              {/* 紧急登录按钮 */}
              <Button
                variant="contained"
                color="warning"
                size="small"
                onClick={() => {
                  if (window.confirm('确定要执行紧急登录吗？这将以管理员身份登录。')) {
                    // 使用 authFixer 中的强制登录功能
                    window.authFixer.forceAdminLogin();
                  }
                }}
                sx={{ opacity: 0.7, mb: 1 }}
              >
                紧急登录
              </Button>

              {/* 紧急退出按钮 */}
              <Button
                variant="contained"
                color="info"
                size="small"
                onClick={() => {
                  if (window.confirm('确定要执行紧急退出吗？这将清除所有登录状态。')) {
                    // 使用 authFixer 中的强制退出功能
                    window.authFixer.forceLogout();
                    // 刷新页面
                    window.location.replace(window.location.origin + '/login?logout=true&t=' + new Date().getTime());
                  }
                }}
                sx={{ opacity: 0.7 }}
              >
                紧急退出
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
                  <Button variant="contained" color="success" onClick={() => {
                    // 修复 localStorage 键名问题
                    const currentUser = localStorage.getItem('currentUser');
                    if (currentUser) {
                      localStorage.setItem('current_user', currentUser);
                      localStorage.setItem('auth_token', `token_${Date.now()}`);
                      localStorage.removeItem('currentUser');
                      setDebugMessage('已将 currentUser 转换为 current_user 并添加令牌');
                    } else {
                      setDebugMessage('未找到 currentUser 数据');
                    }
                  }}>
                    修复 localStorage 键名
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
  </AuthProvider>
  </ErrorProvider>
  )
}

export default App
