import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
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

const Header = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // 认证状态
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // 认证对话框状态
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  // 用户菜单状态
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  // 通知菜单状态
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const notificationMenuOpen = Boolean(notificationAnchorEl);
  const [notifications, setNotifications] = useState([
    { id: 1, message: '您的订单 ORD-123456 已完成', read: false },
    { id: 2, message: '系统已成功充值 ¥100.00', read: false },
    { id: 3, message: '新功能上线：支持抖音平台', read: true }
  ]);

  // 初始化时检查用户登录状态
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsLoggedIn(true);

        // 检查是否是管理员
        setIsAdmin(!!user.isAdmin);
      } catch (err) {
        console.error('Failed to parse user data:', err);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // 打开登录对话框
  const handleOpenAuthDialog = () => {
    setAuthDialogOpen(true);
  };

  // 关闭登录对话框
  const handleCloseAuthDialog = () => {
    setAuthDialogOpen(false);
  };

  // 登录成功回调
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setIsAdmin(!!user.isAdmin);
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
    // 标记所有通知为已读
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // 关闭通知菜单
  const handleCloseNotificationMenu = () => {
    setNotificationAnchorEl(null);
  };

  // 注销
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('currentUser');
    handleCloseUserMenu();
  };

  // 未读通知数量
  const unreadCount = notifications.filter(n => !n.read).length;

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

        {isLoggedIn && (
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

        {isLoggedIn ? (
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

            {isAdmin && (
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
              button
              onClick={handleLogout}
              sx={{
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
            button
            onClick={handleOpenAuthDialog}
            sx={{
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

                {isLoggedIn && (
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
                  {isLoggedIn && (
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

                  {isLoggedIn ? (
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

                        {isAdmin && (
                          <MenuItem component={RouterLink} to="/admin">
                            <AdminPanelSettingsIcon sx={{ mr: 1, fontSize: 20, color: 'primary.main' }} />
                            <Typography color="primary.main">管理员面板</Typography>
                          </MenuItem>
                        )}

                        <Divider sx={{ borderColor: 'rgba(60, 255, 220, 0.1)', my: 1 }} />

                        <MenuItem onClick={handleLogout}>
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
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(60, 255, 220, 0.1)' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            通知
          </Typography>
        </Box>

        {notifications.length > 0 ? (
          <List sx={{ py: 0 }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                sx={{
                  px: 2,
                  py: 1.5,
                  borderBottom: '1px solid rgba(60, 255, 220, 0.05)',
                  bgcolor: notification.read ? 'transparent' : 'rgba(60, 255, 220, 0.05)',
                }}
              >
                <ListItemText
                  primary={notification.message}
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: notification.read ? 'text.secondary' : 'text.primary',
                    fontWeight: notification.read ? 'normal' : 'medium',
                  }}
                />
              </ListItem>
            ))}
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
