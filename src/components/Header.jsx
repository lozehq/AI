import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LoginIcon from '@mui/icons-material/Login';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import { motion } from 'framer-motion';

// 导入认证对话框
import AuthDialog from './AuthDialog';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // 认证状态
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // 认证对话框状态
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  // 用户菜单状态
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  // 初始化时检查用户登录状态
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsLoggedIn(true);
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
  };

  // 打开用户菜单
  const handleOpenUserMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // 关闭用户菜单
  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  // 注销
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    handleCloseUserMenu();
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        AI社区
      </Typography>
      <List>
        <ListItem button component={RouterLink} to="/">
          <ListItemText primary="首页" />
        </ListItem>
        <ListItem button component={RouterLink} to="/services">
          <ListItemText primary="服务" />
        </ListItem>
        <ListItem button component={RouterLink} to="/about">
          <ListItemText primary="关于我们" />
        </ListItem>
        {isLoggedIn ? (
          <ListItem button component={RouterLink} to="/dashboard">
            <ListItemText primary="个人中心" />
          </ListItem>
        ) : (
          <ListItem button onClick={handleOpenAuthDialog}>
            <ListItemText primary="登录/注册" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" sx={{
        background: 'rgba(5, 11, 31, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 240, 255, 0.3)',
        boxShadow: '0 0 20px rgba(0, 240, 255, 0.1)'
      }}>
        <Container maxWidth="lg">
          <Toolbar>
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
                  mr: 2,
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
                  sx={{
                    mr: 1,
                    color: '#00f0ff',
                    textShadow: '0 0 10px rgba(0, 240, 255, 0.7)'
                  }}
                >
                  AI
                </Box>
                社区
              </Typography>
            </motion.div>

            {isMobile ? (
              <>
                <Box sx={{ flexGrow: 1 }} />
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="end"
                  onClick={handleDrawerToggle}
                  sx={{ ml: 2 }}
                >
                  <MenuIcon />
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
                      backgroundColor: 'background.paper',
                      width: 240,
                    },
                  }}
                >
                  {drawer}
                </Drawer>
              </>
            ) : (
              <>
                <Box sx={{ flexGrow: 1, display: 'flex', ml: 4 }}>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button
                      component={RouterLink}
                      to="/"
                      sx={{
                        color: 'text.primary',
                        mx: 1,
                        '&:hover': {
                          color: 'primary.main',
                        }
                      }}
                    >
                      首页
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button
                      component={RouterLink}
                      to="/services"
                      sx={{
                        color: 'text.primary',
                        mx: 1,
                        '&:hover': {
                          color: 'primary.main',
                        }
                      }}
                    >
                      服务
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button
                      component={RouterLink}
                      to="/about"
                      sx={{
                        color: 'text.primary',
                        mx: 1,
                        '&:hover': {
                          color: 'primary.main',
                        }
                      }}
                    >
                      关于我们
                    </Button>
                  </motion.div>
                </Box>
                <Box>
                  {isLoggedIn ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Button
                          component={RouterLink}
                          to="/dashboard"
                          variant="outlined"
                          startIcon={<DashboardIcon />}
                          sx={{
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            mr: 2,
                            '&:hover': {
                              borderColor: 'primary.light',
                              backgroundColor: 'rgba(0, 240, 255, 0.1)',
                            }
                          }}
                        >
                          个人中心
                        </Button>
                      </motion.div>

                      <IconButton
                        onClick={handleOpenUserMenu}
                        sx={{
                          p: 0,
                          border: '2px solid rgba(0, 240, 255, 0.5)',
                          '&:hover': {
                            boxShadow: '0 0 10px rgba(0, 240, 255, 0.7)'
                          }
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'background.paper'
                          }}
                        >
                          {currentUser?.name?.charAt(0) || 'U'}
                        </Avatar>
                      </IconButton>

                      <Menu
                        anchorEl={anchorEl}
                        open={menuOpen}
                        onClose={handleCloseUserMenu}
                        PaperProps={{
                          sx: {
                            background: 'rgba(10, 18, 41, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(0, 240, 255, 0.3)',
                            boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)',
                            mt: 1.5,
                            '& .MuiMenuItem-root': {
                              px: 2,
                              py: 1,
                              my: 0.5,
                              '&:hover': {
                                backgroundColor: 'rgba(0, 240, 255, 0.1)'
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

                        <Divider sx={{ borderColor: 'rgba(0, 240, 255, 0.2)' }} />

                        <MenuItem component={RouterLink} to="/dashboard">
                          <AccountCircleIcon sx={{ mr: 1, fontSize: 20 }} />
                          个人中心
                        </MenuItem>

                        <MenuItem component={RouterLink} to="/dashboard?tab=settings">
                          <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
                          账户设置
                        </MenuItem>

                        <Divider sx={{ borderColor: 'rgba(0, 240, 255, 0.2)' }} />

                        <MenuItem onClick={handleLogout}>
                          <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
                          退出登录
                        </MenuItem>
                      </Menu>
                    </Box>
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
