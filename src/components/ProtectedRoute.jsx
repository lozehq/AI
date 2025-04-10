import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { userManager } from '../utils/dataManager';
import { Box, CircularProgress, Typography, Paper, Button } from '@mui/material';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  // 调试信息
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = userManager.getCurrentUser();

      // 收集调试信息
      const debug = {
        currentUser,
        adminOnly,
        isAdmin: currentUser?.isAdmin,
        allUsers: userManager.getAllUsers()
      };
      setDebugInfo(debug);

      if (!currentUser) {
        console.log('未登录用户尝试访问受保护路由');
        setAuthorized(false);
      } else if (adminOnly && !currentUser.isAdmin) {
        console.log('非管理员用户尝试访问管理员路由');
        console.log('当前用户信息：', currentUser);
        console.log('管理员状态：', currentUser.isAdmin);
        setAuthorized(false);
      } else {
        console.log('用户授权成功，允许访问受保护路由');
        console.log('当前用户信息：', currentUser);
        console.log('管理员状态：', currentUser.isAdmin);
        setAuthorized(true);
      }

      setLoading(false);
    };

    checkAuth();
  }, [adminOnly]);

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

  // 显示调试信息
  if (!authorized) {
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

  return children;
};

export default ProtectedRoute;
