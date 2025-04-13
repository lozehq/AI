import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress, Typography, Paper, Button } from '@mui/material';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { currentUser, isLoggedIn, isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const location = useLocation();

  // 调试信息
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    // 如果认证服务还在加载中，等待它完成
    if (authLoading) {
      console.log('ProtectedRoute: 认证服务正在加载中，等待完成...');
      return;
    }

    // 检查 localStorage 中的用户信息
    const userJson = localStorage.getItem('current_user');
    const token = localStorage.getItem('auth_token');
    console.log('ProtectedRoute: localStorage 中的用户信息:', {
      userJson: userJson ? '存在' : '不存在',
      token: token ? '存在' : '不存在'
    });

    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        console.log('ProtectedRoute: localStorage 中的用户:', user);
      } catch (e) {
        console.error('ProtectedRoute: 解析 localStorage 中的用户信息失败:', e);
      }
    }

    // 收集调试信息
    const debug = {
      currentUser,
      adminOnly,
      isAdmin: isAdmin(),
      isLoggedIn: isLoggedIn()
    };
    setDebugInfo(debug);
    console.log('ProtectedRoute: 调试信息:', debug);

    if (!isLoggedIn()) {
      console.log('ProtectedRoute: 未登录用户尝试访问受保护路由');
      setAuthorized(false);
    } else if (adminOnly && !isAdmin()) {
      console.log('ProtectedRoute: 非管理员用户尝试访问管理员路由');
      console.log('ProtectedRoute: 当前用户信息：', currentUser);
      console.log('ProtectedRoute: 管理员状态：', isAdmin());
      setAuthorized(false);
    } else {
      console.log('ProtectedRoute: 用户授权成功，允许访问受保护路由');
      console.log('ProtectedRoute: 当前用户信息：', currentUser);
      console.log('ProtectedRoute: 管理员状态：', isAdmin());
      setAuthorized(true);
    }

    setLoading(false);
  }, [currentUser, isLoggedIn, isAdmin, adminOnly, authLoading]);

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '50vh'
      }}>
        <CircularProgress color="primary" />
        <Typography variant="body1" sx={{ mt: 2 }}>
          验证权限中...
        </Typography>
      </Box>
    );
  }

  // 如果未授权，重定向到登录页面
  if (!authorized && !loading) {
    // 在开发环境下显示调试信息
    if (process.env.NODE_ENV === 'development') {
      return (
        <Box sx={{ p: 4 }}>
          <Paper sx={{ p: 3, mb: 3, bgcolor: 'rgba(255, 0, 0, 0.05)' }}>
            <Typography variant="h5" color="error" gutterBottom>
              权限不足
            </Typography>
            <Typography variant="body1" gutterBottom>
              {adminOnly ? '您需要管理员权限才能访问此页面。' : '您需要登录才能访问此页面。'}
            </Typography>

            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>调试信息：</Typography>
            <Box component="pre" sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 1, overflow: 'auto', maxHeight: 300 }}>
              {JSON.stringify(debugInfo, null, 2)}
            </Box>
          </Paper>

          <Box sx={{ textAlign: 'center' }}>
            <Button variant="contained" color="primary" onClick={() => window.location.href = '/'}>
              返回首页
            </Button>
          </Box>
        </Box>
      );
    }

    // 在生产环境下重定向到首页，并显示登录对话框
    return <Navigate to="/?login=true" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
