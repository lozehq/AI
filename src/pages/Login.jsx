import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  Link
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useError } from '../contexts/ErrorContext';
import { emergencyReset } from '../utils/emergencyReset';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmergencyOptions, setShowEmergencyOptions] = useState(false);

  const { login, isLoggedIn } = useAuth();
  const { showError } = useError();
  const navigate = useNavigate();
  const location = useLocation();

  // 如果用户已登录，重定向到首页或上一个页面
  React.useEffect(() => {
    console.log('登录页面检查用户是否已登录:', isLoggedIn());
    if (isLoggedIn()) {
      console.log('用户已登录，重定向到上一个页面');
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isLoggedIn, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 表单验证
    if (!username.trim()) {
      showError('请输入用户名', 'warning');
      return;
    }

    if (!password.trim()) {
      showError('请输入密码', 'warning');
      return;
    }

    try {
      setIsLoading(true);

      console.log('开始登录请求，用户名:', username);

      // 调用登录方法
      const result = await login(username, password);
      console.log('登录结果:', result);

      if (result.success) {
        // 登录成功，显示成功消息
        showError('登录成功！', 'success');

        // 打印当前本地存储状态
        console.log('登录后的本地存储:', {
          auth_token: localStorage.getItem('auth_token'),
          current_user: localStorage.getItem('current_user')
        });

        // 重定向到首页或上一个页面
        const from = location.state?.from?.pathname || '/dashboard';
        console.log('重定向到:', from);
        navigate(from, { replace: true });
      } else {
        // 登录失败，显示错误信息
        console.error('登录失败:', result.message);
        showError(result.message || '登录失败，请重试', 'error');
      }
    } catch (error) {
      console.error('登录失败:', error);
      showError('登录失败，请重试', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'rgba(13, 17, 23, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(60, 255, 220, 0.3)',
          borderRadius: 2
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 3, color: 'primary.main' }}>
          登录
        </Typography>

        {/* 错误提示已由 ErrorContext 处理 */}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="用户名"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="密码"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{
              py: 1.5,
              position: 'relative'
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} sx={{ position: 'absolute' }} />
            ) : (
              '登录'
            )}
          </Button>

          {/* 紧急登录选项 */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setShowEmergencyOptions(!showEmergencyOptions);
              }}
              sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
            >
              {showEmergencyOptions ? '隐藏紧急选项' : '遇到登录问题？'}
            </Link>
          </Box>

          {showEmergencyOptions && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ my: 2 }}>
                <Typography variant="caption" sx={{ color: 'warning.main' }}>
                  紧急选项
                </Typography>
              </Divider>

              <Button
                fullWidth
                variant="outlined"
                color="warning"
                onClick={() => {
                  try {
                    // 先清除所有现有状态
                    localStorage.clear();
                    sessionStorage.clear();

                    // 重置离线模式状态
                    window.isOfflineMode = false;

                    // 尝试清除 IndexedDB 数据库
                    try {
                      const deleteRequest = indexedDB.deleteDatabase('AICommunityDB');
                      deleteRequest.onsuccess = () => console.log('IndexedDB 数据库已删除');
                      deleteRequest.onerror = () => console.error('IndexedDB 数据库删除失败');
                    } catch (dbError) {
                      console.error('删除 IndexedDB 数据库失败:', dbError);
                    }

                    // 等待短暂时间确保数据库操作完成
                    setTimeout(() => {
                      try {
                        // 紧急登录为管理员
                        const adminUser = {
                          id: 'admin_emergency_' + Date.now(),  // 添加时间戳避免冲突
                          name: 'admin',
                          email: 'admin@example.com',
                          isAdmin: true,
                          balance: 1000,
                          createdAt: new Date().toISOString()
                        };

                        // 生成离线令牌
                        const token = `offline_${Date.now()}_${Math.random().toString(36).substring(2)}`;

                        // 存储到本地
                        localStorage.setItem('auth_token', token);
                        localStorage.setItem('current_user', JSON.stringify(adminUser));

                        // 设置离线模式
                        window.isOfflineMode = true;

                        // 显示成功消息
                        showError('紧急登录成功！', 'success');

                        // 强制刷新页面，使用硬性刷新忽略缓存
                        window.location.replace(window.location.origin + '/dashboard?t=' + new Date().getTime());
                      } catch (loginError) {
                        console.error('紧急登录失败:', loginError);
                        showError('紧急登录失败，请刷新页面后重试', 'error');
                        // 刷新页面
                        window.location.reload(true);
                      }
                    }, 500);
                  } catch (error) {
                    console.error('紧急登录失败:', error);
                    showError('紧急登录失败，请刷新页面后重试', 'error');
                    // 刷新页面
                    window.location.reload(true);
                  }
                }}
                sx={{ mb: 1 }}
              >
                紧急登录（管理员）
              </Button>

              <Button
                fullWidth
                variant="outlined"
                color="error"
                onClick={() => {
                  if (window.confirm('确定要执行紧急重置吗？这将清除所有本地数据并重新加载页面。')) {
                    emergencyReset();
                  }
                }}
              >
                紧急重置所有数据
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
