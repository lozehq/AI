import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
  Alert,
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';

// 导入用户管理工具
import { userManager } from '../utils/dataManager';
// 导入邀请码管理工具
import { inviteCodeManager } from '../utils/inviteCodeManager';
import KeyIcon from '@mui/icons-material/Key';

const AuthDialog = ({ open, onClose, onLogin }) => {
  // 标签状态
  const [tabValue, setTabValue] = useState(0);

  // 表单状态
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  });

  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    inviteCode: ''
  });

  // UI状态
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 处理标签切换
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  // 处理登录表单变化
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  // 处理注册表单变化
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  // 处理登录提交
  const handleLoginSubmit = () => {
    setLoading(true);
    setError('');

    // 验证表单
    if (!loginForm.username || !loginForm.password) {
      setError('请填写所有必填字段');
      setLoading(false);
      return;
    }

    // 模拟API调用延迟
    setTimeout(() => {
      try {
        // 获取所有用户
        const users = userManager.getAllUsers();

        // 查找匹配的用户
        const user = users.find(u =>
          u.name === loginForm.username &&
          u.password === loginForm.password
        );

        if (user) {
          // 登录成功
          setSuccess('登录成功！' + (user.isAdmin ? ' (管理员账户)' : ''));

          // 打印调试信息
          console.log('登录成功，用户信息：', user);
          console.log('管理员状态：', !!user.isAdmin);

          // 存储用户会话 - 使用与 AuthContext 一致的键名
          localStorage.setItem('current_user', JSON.stringify(user));
          localStorage.setItem('auth_token', `token_${Date.now()}`); // 添加令牌

          // 通知父组件
          if (onLogin) {
            onLogin(user);
          }

          // 关闭对话框
          setTimeout(() => {
            onClose();
          }, 1000);
        } else {
          setError('用户名或密码错误');
        }
      } catch (err) {
        setError('登录失败，请稍后再试');
        console.error('Login error:', err);
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  // 处理注册提交
  const handleRegisterSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 验证表单
      if (!registerForm.username || !registerForm.email || !registerForm.phone || !registerForm.password || !registerForm.inviteCode) {
        setError('请填写所有必填字段，包括邀请码');
        return;
      }

      if (registerForm.password !== registerForm.confirmPassword) {
        setError('两次输入的密码不一致');
        return;
      }

      // 验证邀请码 - 异步函数
      console.log('开始验证邀请码:', registerForm.inviteCode);
      const inviteCodeResult = await inviteCodeManager.validateInviteCode(registerForm.inviteCode);
      console.log('邀请码验证结果:', inviteCodeResult);

      if (!inviteCodeResult.valid) {
        setError('邀请码无效: ' + inviteCodeResult.message);
        return;
      }

      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 获取所有用户 - 异步函数
      console.log('开始获取所有用户');
      const users = await userManager.getAllUsers();
      console.log('获取到用户列表:', users);

      // 检查用户名是否已存在
      if (Array.isArray(users) && users.some(u => u.name === registerForm.username)) {
        setError('用户名已存在');
        return;
      }

      // 使用邀请码 - 异步函数
      console.log('开始使用邀请码:', registerForm.inviteCode);
      const useResult = await inviteCodeManager.useInviteCode(registerForm.inviteCode);
      console.log('使用邀请码结果:', useResult);

      if (!useResult.success) {
        setError('使用邀请码失败: ' + useResult.message);
        return;
      }

      // 创建新用户 - 异步函数
      console.log('开始创建新用户');
      const createResult = await userManager.createUser({
        name: registerForm.username,
        email: registerForm.email,
        phone: registerForm.phone,
        password: registerForm.password,
        balance: 0.00, // 新用户初始余额
        isAdmin: inviteCodeResult.isAdmin // 根据邀请码设置管理员权限
      });
      console.log('创建用户结果:', createResult);

      if (!createResult.success) {
        // 处理错误对象
        if (createResult.errors) {
          // 如果有通用错误消息
          if (createResult.errors.general) {
            setError('创建用户失败: ' + createResult.errors.general);
          }
          // 如果有具体字段错误
          else if (Object.keys(createResult.errors).length > 0) {
            const errorField = Object.keys(createResult.errors)[0];
            const errorMsg = createResult.errors[errorField];
            setError(`创建用户失败: ${errorField} - ${errorMsg}`);
          }
          // 如果没有具体错误信息
          else {
            setError('创建用户失败，请重试');
          }
        } else {
          setError('创建用户失败: ' + (createResult.message || '请重试'));
        }
        console.error('创建用户错误详情:', createResult);
        return;
      }

      const newUser = createResult.user;

      // 注册成功
      setSuccess('注册成功！' + (inviteCodeResult.isAdmin ? ' (管理员账户)' : ''));

      // 存储用户会话 - 使用与 AuthContext 一致的键名
      localStorage.setItem('current_user', JSON.stringify(newUser));
      localStorage.setItem('auth_token', `token_${Date.now()}`); // 添加令牌

      // 通知父组件
      if (onLogin) {
        onLogin(newUser);
      }

      // 关闭对话框
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError('注册失败，请稍后再试');
      console.error('Register error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(5px)'
          }
        }
      }}
      sx={{
        '& .MuiDialog-paper': {
          background: 'rgba(10, 18, 41, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          border: '1px solid rgba(0, 240, 255, 0.3)',
          boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
        pb: 1
      }}>
        <Typography variant="h6" sx={{ color: 'primary.main' }}>
          {tabValue === 0 ? '用户登录' : '注册账号'}
        </Typography>
        <IconButton
          onClick={onClose}
          disabled={loading}
          sx={{
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            mb: 3,
            '& .MuiTab-root': {
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main',
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: 'primary.main',
              height: 3,
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          <Tab label="登录" />
          <Tab label="注册" />
        </Tabs>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
          >
            {success}
          </Alert>
        )}

        {tabValue === 0 ? (
          // 登录表单
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TextField
              fullWidth
              label="用户名"
              name="username"
              value={loginForm.username}
              onChange={handleLoginChange}
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="密码"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={loginForm.password}
              onChange={handleLoginChange}
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography
                variant="body2"
                color="primary.main"
                sx={{
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                忘记密码？
              </Typography>
            </Box>
          </motion.div>
        ) : (
          // 注册表单
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TextField
              fullWidth
              label="用户名"
              name="username"
              value={registerForm.username}
              onChange={handleRegisterChange}
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="电子邮箱"
              name="email"
              type="email"
              value={registerForm.email}
              onChange={handleRegisterChange}
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="手机号码"
              name="phone"
              value={registerForm.phone}
              onChange={handleRegisterChange}
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneAndroidIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="密码"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={registerForm.password}
              onChange={handleRegisterChange}
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="确认密码"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={registerForm.confirmPassword}
              onChange={handleRegisterChange}
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="邀请码"
              name="inviteCode"
              value={registerForm.inviteCode}
              onChange={handleRegisterChange}
              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <KeyIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
              helperText="请输入邀请码，没有邀请码将无法注册"
            />
          </motion.div>
        )}
      </DialogContent>

      <DialogActions sx={{
        px: 3,
        pb: 3,
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={tabValue === 0 ? handleLoginSubmit : handleRegisterSubmit}
          disabled={loading}
          sx={{
            minWidth: 120,
            py: 1,
            fontSize: '1rem'
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            tabValue === 0 ? '登录' : '注册'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuthDialog;
