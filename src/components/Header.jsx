import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Container,
  useMediaQuery,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Tooltip,
  alpha
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LoginIcon from '@mui/icons-material/Login';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { motion, AnimatePresence } from 'framer-motion';

// 导入认证对话框
import AuthDialog from './AuthDialog';

// 导入用户管理工具
import { userManager } from '../utils/dataManager';
import { notificationManager } from '../utils/notificationManager';

const Header = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // 认证状态
  const { currentUser, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // 认证对话框状态
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  // 用户菜单状态
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  // 通知菜单状态
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const notificationMenuOpen = Boolean(notificationAnchorEl);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [readStatus, setReadStatus] = useState({});

  // 加载通知
  const loadNotifications = async () => {
    if (!isLoggedIn || !currentUser) {
      console.log('用户未登录或用户信息不存在，无法加载通知');
      return;
    }

    try {
      const userNotifications = await notificationManager.getUserNotifications(currentUser.id);
      console.log('从 notificationManager 获取的用户通知：', userNotifications);

      const userReadStatus = await notificationManager.getUserReadStatus(currentUser.id);
      console.log('用户已读通知状态：', userReadStatus);

      // 过滤出未读通知
      const unreadNotifications = userNotifications.filter(notification => {
        return !userReadStatus.includes(notification.id);
      });
      console.log('未读通知数量：', unreadNotifications.length);

      setNotifications(userNotifications);
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error('加载通知失败:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // 不再需要初始化用户登录状态，因为 AuthContext 已经处理了

  // 当用户登录状态变化时加载通知
  useEffect(() => {
    // 打印当前用户状态，用于调试
    console.log('当前用户状态:', { isLoggedIn: isLoggedIn(), currentUser });

    if (isLoggedIn() && currentUser) {
      console.log('用户已登录，加载通知');
      loadNotifications();

      // 每分钟刷新一次通知
      const interval = setInterval(loadNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, currentUser]);

  // 当通知列表变化时，加载每个通知的已读状态
  useEffect(() => {
    const loadReadStatus = async () => {
      if (!isLoggedIn || !currentUser || notifications.length === 0) return;

      const newReadStatus = {};
      try {
        const userReadStatus = await notificationManager.getUserReadStatus(currentUser.id);

        // 为每个通知设置已读状态
        notifications.forEach(notification => {
          newReadStatus[notification.id] = userReadStatus.includes(notification.id);
        });

        setReadStatus(newReadStatus);
      } catch (error) {
        console.error('加载通知已读状态失败:', error);
      }
    };

    loadReadStatus();
  }, [notifications, isLoggedIn, currentUser]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // 打开认证对话框
  const handleOpenAuthDialog = () => {
    setAuthDialogOpen(true);
  };

  // 关闭认证对话框
  const handleCloseAuthDialog = () => {
    setAuthDialogOpen(false);
  };

  // 登录成功回调
  const handleLoginSuccess = (user) => {
    console.log('登录成功，用户信息：', user);
    // 关闭对话框
    setAuthDialogOpen(false);
  };

  // 打开用户菜单
  const handleOpenUserMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // 关闭用户菜单
  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  // 打开通知菜单
  const handleOpenNotificationMenu = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  // 关闭通知菜单
  const handleCloseNotificationMenu = () => {
    setNotificationAnchorEl(null);
  };

  // 标记所有通知为已读
  const handleMarkAllAsRead = async () => {
    if (currentUser) {
      try {
        // 使用 markAllAsRead 方法
        await notificationManager.markAllAsRead(currentUser.id);
        await loadNotifications();
      } catch (error) {
        console.error('标记所有通知已读失败:', error);
      }
    }
  };

  // 标记单个通知为已读
  const handleMarkAsRead = async (notificationId) => {
    console.log('标记通知为已读：', notificationId);
    if (currentUser) {
      try {
        const result = await notificationManager.markAsRead(currentUser.id, notificationId);
        console.log('标记通知已读结果：', result);
        await loadNotifications();
      } catch (error) {
        console.error('标记通知已读失败:', error);
      }
    } else {
      console.log('用户未登录，无法标记通知为已读');
    }
  };

  // 检查通知是否已读
  const isNotificationRead = async (notificationId) => {
    if (!currentUser) return true;

    try {
      const userReadStatus = await notificationManager.getUserReadStatus(currentUser.id);
      return userReadStatus.includes(notificationId);
    } catch (error) {
      console.error('获取用户已读状态失败:', error);
      return false;
    }
  };

  // 注销
  const handleLogout = async () => {
    try {
      console.log('开始注销操作');

      // 先手动清除所有本地存储，确保即使 API 调用失败也能正常注销
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');

      // 清除其他可能影响登录状态的存储
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('current_user');

      // 重置离线模式状态
      window.isOfflineMode = false;

      // 然后调用注销 API
      try {
        const result = await logout();
        console.log('注销 API 调用结果:', result);
      } catch (logoutError) {
        console.warn('注销 API 调用失败，但本地存储已清除:', logoutError);
      }

      handleCloseUserMenu();
      navigate('/');

      // 打印当前本地存储状态
      console.log('注销后的本地存储:', {
        auth_token: localStorage.getItem('auth_token'),
        current_user: localStorage.getItem('current_user')
      });

      // 强制清除所有缓存并刷新页面
      // 使用硬性刷新，忽略缓存
      window.location.href = window.location.origin + '?t=' + new Date().getTime();
    } catch (error) {
      console.error('注销失败:', error);

      // 即使出错，也尝试清除本地存储并刷新页面
      try {
        // 清除所有存储
        localStorage.clear();
        sessionStorage.clear();

        // 重置离线模式状态
        window.isOfflineMode = false;

        handleCloseUserMenu();
        navigate('/');

        // 强制刷新
        window.location.href = window.location.origin + '?t=' + new Date().getTime();
      } catch (clearError) {
        console.error('清除本地存储失败:', clearError);
        // 最后的尝试，直接刷新
        window.location.reload(true);
      }
    }
  };

  // 未读通知数量已由loadNotifications函数设置

  // 导航链接
  const navLinks = [
    { text: '首页', path: '/' },
    { text: '服务', path: '/service' },
    { text: '订单', path: '/orders' },
    { text: '关于我们', path: '/about' }
  ];

  const drawer = (
    <Box sx={{
      textAlign: 'center',
      height: '100%',
      background: 'rgba(3, 11, 23, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRight: '1px solid rgba(60, 255, 220, 0.1)',
    }}>
      <Box sx={{
        py: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderBottom: '1px solid rgba(60, 255, 220, 0.1)',
        mb: 2
      }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            fontFamily: 'Orbitron',
            fontWeight: 700,
            color: 'primary.main',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            mb: 1
          }}
        >
          <Box component="span" className="gradient-text" sx={{ mr: 1 }}>
            AI
          </Box>
          社区
        </Typography>

        {(typeof isLoggedIn === 'function' ? isLoggedIn() : isLoggedIn) && (
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                mb: 1,
                bgcolor: 'primary.main',
                color: 'background.paper',
                border: '2px solid rgba(60, 255, 220, 0.5)',
                boxShadow: '0 0 10px rgba(60, 255, 220, 0.3)'
              }}
            >
              {currentUser?.name?.charAt(0) || 'U'}
            </Avatar>
            <Typography variant="subtitle1" color="primary.main">
              {currentUser?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              余额: ¥{currentUser?.balance?.toFixed(2)}
            </Typography>
          </Box>
        )}
      </Box>

      <List>
        {navLinks.map((link) => (
          <ListItem
            key={link.path}
            component={RouterLink}
            to={link.path}
            selected={location.pathname === link.path}
            sx={{
              borderRadius: 1,
              mx: 1,
              mb: 1,
              '&.Mui-selected': {
                bgcolor: 'rgba(60, 255, 220, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(60, 255, 220, 0.15)',
                }
              },
              '&:hover': {
                bgcolor: 'rgba(60, 255, 220, 0.05)',
              }
            }}
          >
            <ListItemText
              primary={link.text}
              primaryTypographyProps={{
                sx: {
                  textAlign: 'center',
                  fontWeight: location.pathname === link.path ? 600 : 400,
                  color: location.pathname === link.path ? 'primary.main' : 'text.primary'
                }
              }}
            />
          </ListItem>
        ))}

        {(typeof isLoggedIn === 'function' ? isLoggedIn() : isLoggedIn) ? (
          <>
            <ListItem
              component={RouterLink}
              to="/dashboard"
              selected={location.pathname === '/dashboard'}
              sx={{
                borderRadius: 1,
                mx: 1,
                mb: 1,
                '&.Mui-selected': {
                  bgcolor: 'rgba(60, 255, 220, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(60, 255, 220, 0.15)',
                  }
                },
                '&:hover': {
                  bgcolor: 'rgba(60, 255, 220, 0.05)',
                }
              }}
            >
              <ListItemText
                primary="个人中心"
                primaryTypographyProps={{
                  sx: {
                    textAlign: 'center',
                    fontWeight: location.pathname === '/dashboard' ? 600 : 400,
                    color: location.pathname === '/dashboard' ? 'primary.main' : 'text.primary'
                  }
                }}
              />
            </ListItem>

            {(typeof isAdmin === 'function' ? isAdmin() : isAdmin) && (
              <ListItem
                component={RouterLink}
                to="/admin"
                selected={location.pathname === '/admin'}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  mb: 1,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(60, 255, 220, 0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(60, 255, 220, 0.15)',
                    }
                  },
                  '&:hover': {
                    bgcolor: 'rgba(60, 255, 220, 0.05)',
                  }
                }}
              >
                <ListItemText
                  primary="管理员面板"
                  primaryTypographyProps={{
                    sx: {
                      textAlign: 'center',
                      fontWeight: location.pathname === '/admin' ? 600 : 400,
                      color: 'primary.main'
                    }
                  }}
                />
              </ListItem>
            )}

            <ListItem
              onClick={handleLogout}
              sx={{
                button: true,
                borderRadius: 1,
                mx: 1,
                mb: 1,
                '&:hover': {
                  bgcolor: 'rgba(255, 77, 106, 0.1)',
                }
              }}
            >
              <ListItemText
                primary="退出登录"
                primaryTypographyProps={{
                  sx: {
                    textAlign: 'center',
                    color: 'error.main'
                  }
                }}
              />
            </ListItem>
          </>
        ) : (
          <ListItem
            onClick={handleOpenAuthDialog}
            sx={{
              button: true,
              borderRadius: 1,
              mx: 1,
              mb: 1,
              bgcolor: 'primary.main',
              color: 'background.paper',
              '&:hover': {
                bgcolor: 'primary.dark',
              }
            }}
          >
            <ListItemText
              primary="登录/注册"
              primaryTypographyProps={{
                sx: {
                  textAlign: 'center',
                  fontWeight: 600,
                  color: 'background.paper'
                }
              }}
            />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'rgba(3, 11, 23, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(60, 255, 220, 0.1)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ py: 1 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography
                variant="h6"
                component={RouterLink}
                to="/"
                sx={{
                  fontFamily: 'Orbitron',
                  fontWeight: 700,
                  letterSpacing: '.1rem',
                  color: 'primary.main',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Box
                  component="span"
                  className="gradient-text"
                  sx={{
                    mr: 1,
                    fontSize: { xs: '1.5rem', md: '1.8rem' },
                    fontWeight: 800
                  }}
                >
                  AI
                </Box>
                <Box
                  component="span"
                  sx={{
                    fontSize: { xs: '1.2rem', md: '1.5rem' },
                  }}
                >
                  社区
                </Box>
              </Typography>
            </motion.div>

            {isMobile ? (
              <>
                <Box sx={{ flexGrow: 1 }} />

                {!(typeof isLoggedIn === 'function' ? isLoggedIn() : isLoggedIn) && (
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<LoginIcon />}
                    onClick={handleOpenAuthDialog}
                    sx={{ mr: 1 }}
                  >
                    登录
                  </Button>
                )}

                {(typeof isLoggedIn === 'function' ? isLoggedIn() : isLoggedIn) && (
                  <Box sx={{ mr: 1 }}>
                    <Tooltip title="通知">
                      <IconButton
                        color="inherit"
                        onClick={handleOpenNotificationMenu}
                        sx={{
                          mr: 1,
                          border: '1px solid rgba(60, 255, 220, 0.3)',
                          '&:hover': {
                            bgcolor: 'rgba(60, 255, 220, 0.1)',
                          }
                        }}
                      >
                        <Badge badgeContent={unreadCount} color="error">
                          <NotificationsIcon color="primary" />
                        </Badge>
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}

                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="end"
                  onClick={handleDrawerToggle}
                  sx={{
                    border: '1px solid rgba(60, 255, 220, 0.3)',
                    '&:hover': {
                      bgcolor: 'rgba(60, 255, 220, 0.1)',
                    }
                  }}
                >
                  <MenuIcon color="primary" />
                </IconButton>

                <Drawer
                  anchor="right"
                  open={mobileOpen}
                  onClose={handleDrawerToggle}
                  ModalProps={{
                    keepMounted: true,
                  }}
                  PaperProps={{
                    sx: {
                      width: 280,
                    },
                  }}
                >
                  {drawer}
                </Drawer>
              </>
            ) : (
              <>
                <Box sx={{ flexGrow: 1, display: 'flex', ml: 4 }}>
                  {navLinks.map((link) => (
                    <motion.div key={link.path} whileHover={{ scale: 1.05 }}>
                      <Button
                        component={RouterLink}
                        to={link.path}
                        sx={{
                          mx: 1,
                          px: 2,
                          py: 1,
                          position: 'relative',
                          color: location.pathname === link.path ? 'primary.main' : 'text.primary',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: location.pathname === link.path ? '10%' : '50%',
                            width: location.pathname === link.path ? '80%' : '0%',
                            height: '2px',
                            bgcolor: 'primary.main',
                            transition: 'all 0.3s ease',
                            boxShadow: location.pathname === link.path ? '0 0 8px rgba(60, 255, 220, 0.5)' : 'none',
                          },
                          '&:hover': {
                            bgcolor: 'transparent',
                            color: 'primary.main',
                            '&::after': {
                              left: '10%',
                              width: '80%',
                            }
                          }
                        }}
                      >
                        {link.text}
                      </Button>
                    </motion.div>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {(typeof isLoggedIn === 'function' ? isLoggedIn() : isLoggedIn) && (
                    <>
                      <Tooltip title="通知">
                        <IconButton
                          onClick={handleOpenNotificationMenu}
                          sx={{
                            mr: 2,
                            border: '1px solid rgba(60, 255, 220, 0.3)',
                            '&:hover': {
                              bgcolor: 'rgba(60, 255, 220, 0.1)',
                              boxShadow: '0 0 10px rgba(60, 255, 220, 0.3)'
                            }
                          }}
                        >
                          <Badge badgeContent={unreadCount} color="error">
                            <NotificationsIcon color="primary" />
                          </Badge>
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="账户余额">
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mr: 2,
                            py: 0.5,
                            px: 2,
                            borderRadius: 2,
                            border: '1px solid rgba(60, 255, 220, 0.3)',
                            bgcolor: 'rgba(60, 255, 220, 0.05)',
                          }}
                        >
                          <WalletIcon
                            color="primary"
                            fontSize="small"
                            sx={{ mr: 1 }}
                          />
                          <Typography
                            variant="body2"
                            color="primary.main"
                            fontWeight="bold"
                          >
                            ¥{currentUser?.balance?.toFixed(2) || '0.00'}
                          </Typography>
                        </Box>
                      </Tooltip>

                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Button
                          component={RouterLink}
                          to="/dashboard"
                          variant="outlined"
                          startIcon={<DashboardIcon />}
                          sx={{
                            mr: 2,
                            borderColor: location.pathname === '/dashboard' ? 'primary.main' : 'rgba(60, 255, 220, 0.3)',
                            color: location.pathname === '/dashboard' ? 'primary.main' : 'text.primary',
                            bgcolor: location.pathname === '/dashboard' ? 'rgba(60, 255, 220, 0.05)' : 'transparent',
                            '&:hover': {
                              borderColor: 'primary.main',
                              bgcolor: 'rgba(60, 255, 220, 0.1)',
                            }
                          }}
                        >
                          个人中心
                        </Button>
                      </motion.div>
                    </>
                  )}

                  {(typeof isLoggedIn === 'function' ? isLoggedIn() : isLoggedIn) ? (
                    <>

                      <Tooltip title="账户设置">
                        <IconButton
                          onClick={handleOpenUserMenu}
                          sx={{
                            p: 0,
                            border: '2px solid rgba(60, 255, 220, 0.5)',
                            '&:hover': {
                              boxShadow: '0 0 10px rgba(60, 255, 220, 0.7)'
                            }
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.2),
                              color: 'primary.main',
                              fontFamily: 'Orbitron',
                              fontWeight: 'bold'
                            }}
                          >
                            {currentUser?.name?.charAt(0) || 'U'}
                          </Avatar>
                        </IconButton>
                      </Tooltip>

                      <Menu
                        anchorEl={anchorEl}
                        open={menuOpen}
                        onClose={handleCloseUserMenu}
                        PaperProps={{
                          sx: {
                            mt: 1.5,
                            background: 'rgba(3, 11, 23, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(60, 255, 220, 0.1)',
                            boxShadow: '0 0 20px rgba(0, 0, 0, 0.2), 0 0 10px rgba(60, 255, 220, 0.1)',
                            '& .MuiMenuItem-root': {
                              px: 2,
                              py: 1,
                              my: 0.5,
                              borderRadius: 1,
                              mx: 0.5,
                              '&:hover': {
                                bgcolor: 'rgba(60, 255, 220, 0.1)'
                              }
                            }
                          }
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                      >
                        <Box sx={{ px: 2, py: 1 }}>
                          <Typography variant="subtitle1" color="primary.main">
                            {currentUser?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            余额: ¥{currentUser?.balance?.toFixed(2)}
                          </Typography>
                        </Box>

                        <Divider sx={{ borderColor: 'rgba(60, 255, 220, 0.1)', my: 1 }} />

                        <MenuItem component={RouterLink} to="/dashboard">
                          <AccountCircleIcon sx={{ mr: 1, fontSize: 20 }} />
                          个人中心
                        </MenuItem>

                        <MenuItem component={RouterLink} to="/dashboard?tab=settings">
                          <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
                          账户设置
                        </MenuItem>

                        {/* 管理员面板入口 - 只对管理员显示 */}
                        {(typeof isAdmin === 'function' ? isAdmin() : isAdmin) && (
                          <MenuItem component={RouterLink} to="/admin">
                            <AdminPanelSettingsIcon sx={{ mr: 1, fontSize: 20, color: 'primary.main' }} />
                            <Typography color="primary.main">管理员面板</Typography>
                          </MenuItem>
                        )}

                        <Divider sx={{ borderColor: 'rgba(60, 255, 220, 0.1)', my: 1 }} />

                        <MenuItem onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          // 直接清除所有存储并刷新
                          console.log('强制清除所有存储并退出');

                          // 清除所有本地存储
                          localStorage.clear();
                          sessionStorage.clear();

                          // 重置离线模式状态
                          window.isOfflineMode = false;

                          // 尝试清除 IndexedDB 中的会话数据
                          try {
                            const request = indexedDB.deleteDatabase('AICommunityDB');
                            request.onsuccess = () => console.log('IndexedDB 数据库已删除');
                            request.onerror = () => console.error('IndexedDB 数据库删除失败');
                          } catch (dbError) {
                            console.error('删除 IndexedDB 数据库失败:', dbError);
                          }

                          // 关闭菜单
                          handleCloseUserMenu();

                          // 强制刷新页面，使用硬性刷新忽略缓存
                          setTimeout(() => {
                            window.location.href = window.location.origin + '?logout=true&t=' + new Date().getTime();
                          }, 100);
                        }}>
                          <LogoutIcon sx={{ mr: 1, fontSize: 20, color: 'error.main' }} />
                          <Typography color="error.main">退出登录</Typography>
                        </MenuItem>
                      </Menu>
                    </>
                  ) : (
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<LoginIcon />}
                        onClick={handleOpenAuthDialog}
                        className="pulse-animation"
                      >
                        登录/注册
                      </Button>
                    </motion.div>
                  )}
                </Box>
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* 通知菜单 */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={notificationMenuOpen}
        onClose={handleCloseNotificationMenu}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: 320,
            maxHeight: 400,
            background: 'rgba(3, 11, 23, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(60, 255, 220, 0.1)',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.2), 0 0 10px rgba(60, 255, 220, 0.1)',
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(60, 255, 220, 0.1)' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            通知
          </Typography>

          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              sx={{ color: 'primary.main', fontSize: '0.75rem' }}
            >
              全部已读
            </Button>
          )}
        </Box>

        {notifications.length > 0 ? (
          <List sx={{ py: 0 }}>
            {notifications.map((notification) => {
              const isRead = readStatus[notification.id] || false;
              return (
                <ListItem
                  key={notification.id}
                  button={true}
                  onClick={() => handleMarkAsRead(notification.id)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid rgba(60, 255, 220, 0.05)',
                    bgcolor: isRead ? 'transparent' : 'rgba(60, 255, 220, 0.05)',
                  }}
                >
                  <ListItemText
                    primary={notification.title}
                    secondary={notification.content}
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: isRead ? 'text.secondary' : 'primary.main',
                      fontWeight: isRead ? 'normal' : 'medium',
                    }}
                    secondaryTypographyProps={{
                      variant: 'caption',
                      color: 'text.secondary',
                      noWrap: true
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              暂无通知
            </Typography>
          </Box>
        )}

        <Box sx={{ p: 1.5, textAlign: 'center', borderTop: '1px solid rgba(60, 255, 220, 0.1)' }}>
          <Button
            component={RouterLink}
            to="/notifications"
            size="small"
            sx={{
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'rgba(60, 255, 220, 0.05)',
              }
            }}
          >
            查看全部通知
          </Button>
        </Box>
      </Menu>

      {/* 登录/注册对话框 */}
      <AuthDialog
        open={authDialogOpen}
        onClose={handleCloseAuthDialog}
        onLogin={handleLoginSuccess}
      />
    </>
  );
};

export default Header;
