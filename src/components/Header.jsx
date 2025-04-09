import React, { useState } from 'react';
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
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LoginIcon from '@mui/icons-material/Login';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { motion } from 'framer-motion';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Mock authentication state (would be replaced with actual auth)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Mock login function (would be replaced with actual auth)
  const handleLogin = () => {
    setIsLoggedIn(true);
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
          <ListItem button onClick={handleLogin}>
            <ListItemText primary="登录/注册" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
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
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button 
                      component={RouterLink}
                      to="/dashboard"
                      variant="outlined" 
                      startIcon={<DashboardIcon />}
                      sx={{ 
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        '&:hover': {
                          borderColor: 'primary.light',
                          backgroundColor: 'rgba(0, 240, 255, 0.1)',
                        }
                      }}
                    >
                      个人中心
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      startIcon={<LoginIcon />}
                      onClick={handleLogin}
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
  );
};

export default Header;
