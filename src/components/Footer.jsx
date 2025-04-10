import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import ChatIcon from '@mui/icons-material/Chat';

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        mt: 'auto',
        background: 'linear-gradient(to top, rgba(5, 11, 31, 0.9), rgba(10, 18, 41, 0.8))',
        borderTop: '1px solid rgba(0, 240, 255, 0.2)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid container size={{ xs: 12, md: 4 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
                  mb: 2
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

              <Typography variant="body2" color="text.secondary" paragraph>
                专注于为主流短视频平台内容创作者和营销人员提供初期数据增长与曝光优化的一站式自助服务平台。
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <motion.div whileHover={{ scale: 1.2, rotate: 5 }}>
                  <IconButton
                    size="small"
                    sx={{
                      color: 'primary.main',
                      '&:hover': {
                        color: 'primary.light',
                        boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)'
                      }
                    }}
                  >
                    <ChatIcon fontSize="small" />
                  </IconButton>
                </motion.div>

                <motion.div whileHover={{ scale: 1.2, rotate: 5 }}>
                  <IconButton
                    size="small"
                    sx={{
                      color: 'primary.main',
                      '&:hover': {
                        color: 'primary.light',
                        boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)'
                      }
                    }}
                  >
                    <InstagramIcon fontSize="small" />
                  </IconButton>
                </motion.div>

                <motion.div whileHover={{ scale: 1.2, rotate: 5 }}>
                  <IconButton
                    size="small"
                    sx={{
                      color: 'primary.main',
                      '&:hover': {
                        color: 'primary.light',
                        boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)'
                      }
                    }}
                  >
                    <TwitterIcon fontSize="small" />
                  </IconButton>
                </motion.div>

                <motion.div whileHover={{ scale: 1.2, rotate: 5 }}>
                  <IconButton
                    size="small"
                    sx={{
                      color: 'primary.main',
                      '&:hover': {
                        color: 'primary.light',
                        boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)'
                      }
                    }}
                  >
                    <YouTubeIcon fontSize="small" />
                  </IconButton>
                </motion.div>
              </Box>
            </motion.div>
          </Grid>

          <Grid container size={{ xs: 6, md: 2 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Typography variant="h6" gutterBottom>
                服务
              </Typography>

              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <Link
                    component={RouterLink}
                    to="/services/douyin"
                    color="text.secondary"
                    underline="hover"
                    sx={{
                      '&:hover': {
                        color: 'primary.main',
                        textShadow: '0 0 5px rgba(0, 240, 255, 0.5)'
                      }
                    }}
                  >
                    抖音推广
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Link
                    component={RouterLink}
                    to="/services/xiaohongshu"
                    color="text.secondary"
                    underline="hover"
                    sx={{
                      '&:hover': {
                        color: 'primary.main',
                        textShadow: '0 0 5px rgba(0, 240, 255, 0.5)'
                      }
                    }}
                  >
                    小红书推广
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Link
                    component={RouterLink}
                    to="/services/bilibili"
                    color="text.secondary"
                    underline="hover"
                    sx={{
                      '&:hover': {
                        color: 'primary.main',
                        textShadow: '0 0 5px rgba(0, 240, 255, 0.5)'
                      }
                    }}
                  >
                    哔哩哔哩推广
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Link
                    component={RouterLink}
                    to="/services/wechat"
                    color="text.secondary"
                    underline="hover"
                    sx={{
                      '&:hover': {
                        color: 'primary.main',
                        textShadow: '0 0 5px rgba(0, 240, 255, 0.5)'
                      }
                    }}
                  >
                    微信推广
                  </Link>
                </Box>
              </Box>
            </motion.div>
          </Grid>

          <Grid container size={{ xs: 6, md: 2 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Typography variant="h6" gutterBottom>
                关于我们
              </Typography>

              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <Link
                    component={RouterLink}
                    to="/about"
                    color="text.secondary"
                    underline="hover"
                    sx={{
                      '&:hover': {
                        color: 'primary.main',
                        textShadow: '0 0 5px rgba(0, 240, 255, 0.5)'
                      }
                    }}
                  >
                    公司简介
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Link
                    component={RouterLink}
                    to="/team"
                    color="text.secondary"
                    underline="hover"
                    sx={{
                      '&:hover': {
                        color: 'primary.main',
                        textShadow: '0 0 5px rgba(0, 240, 255, 0.5)'
                      }
                    }}
                  >
                    团队介绍
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Link
                    component={RouterLink}
                    to="/contact"
                    color="text.secondary"
                    underline="hover"
                    sx={{
                      '&:hover': {
                        color: 'primary.main',
                        textShadow: '0 0 5px rgba(0, 240, 255, 0.5)'
                      }
                    }}
                  >
                    联系我们
                  </Link>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Link
                    component={RouterLink}
                    to="/careers"
                    color="text.secondary"
                    underline="hover"
                    sx={{
                      '&:hover': {
                        color: 'primary.main',
                        textShadow: '0 0 5px rgba(0, 240, 255, 0.5)'
                      }
                    }}
                  >
                    加入我们
                  </Link>
                </Box>
              </Box>
            </motion.div>
          </Grid>

          <Grid container size={{ xs: 12, md: 4 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Typography variant="h6" gutterBottom>
                联系方式
              </Typography>

              <Typography variant="body2" color="text.secondary" paragraph>
                客服时间: 周一至周日 9:00-22:00
              </Typography>

              <Typography variant="body2" color="text.secondary" paragraph>
                客服邮箱: support@ai-community.com
              </Typography>

              <Typography variant="body2" color="text.secondary">
                微信客服: AI-Community-Service
              </Typography>
            </motion.div>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(0, 240, 255, 0.2)' }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'center' : 'flex-start',
            textAlign: isMobile ? 'center' : 'left',
            gap: 2
          }}
        >
          <Typography variant="body2" color="text.secondary">
            &copy; {currentYear} AI社区 - 短视频推广服务平台. 保留所有权利.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 3,
              flexWrap: 'wrap',
              justifyContent: isMobile ? 'center' : 'flex-end'
            }}
          >
            <Link
              component={RouterLink}
              to="/terms"
              color="text.secondary"
              underline="hover"
              variant="body2"
              sx={{
                '&:hover': {
                  color: 'primary.main'
                }
              }}
            >
              服务条款
            </Link>

            <Link
              component={RouterLink}
              to="/privacy"
              color="text.secondary"
              underline="hover"
              variant="body2"
              sx={{
                '&:hover': {
                  color: 'primary.main'
                }
              }}
            >
              隐私政策
            </Link>

            <Link
              component={RouterLink}
              to="/faq"
              color="text.secondary"
              underline="hover"
              variant="body2"
              sx={{
                '&:hover': {
                  color: 'primary.main'
                }
              }}
            >
              常见问题
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
