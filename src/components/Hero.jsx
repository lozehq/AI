import React, { useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  useMediaQuery,
  useTheme,
  Stack,
  Chip
} from '@mui/material';
import { motion, useAnimation, useInView } from 'framer-motion';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VerifiedIcon from '@mui/icons-material/Verified';

const Hero = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, threshold: 0.1 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }
    }
  };

  const floatingIconVariants = {
    hidden: { y: 0, opacity: 0 },
    visible: (custom) => ({
      y: [0, -10, 0],
      opacity: 1,
      transition: {
        y: {
          repeat: Infinity,
          duration: 3 + custom * 0.5,
          ease: "easeInOut",
          repeatType: "reverse"
        },
        opacity: {
          duration: 0.8,
          ease: "easeIn"
        }
      }
    })
  };

  const platforms = [
    { name: '抖音', color: '#fe2c55' },
    { name: '小红书', color: '#fe2c55' },
    { name: 'B站', color: '#00a1d6' },
    { name: '快手', color: '#00c234' },
    { name: '公众号', color: '#07c160' },
    { name: '视频号', color: '#07c160' }
  ];

  const features = [
    { icon: <SpeedIcon />, text: '快速增长' },
    { icon: <TrendingUpIcon />, text: '精准推广' },
    { icon: <VerifiedIcon />, text: '安全可靠' }
  ];

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 10, md: 15 },
        position: 'relative',
        overflow: 'hidden',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(3, 11, 23, 0.9) 0%, rgba(5, 19, 38, 0.9) 100%)',
      }}
    >
      {/* Animated grid background */}
      <Box
        className="grid-background"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          opacity: 0.3
        }}
      />

      {/* Animated glowing orbs */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          overflow: 'hidden'
        }}
      >
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              background: `radial-gradient(circle, ${i % 2 === 0 ? 'rgba(60, 255, 220, 0.15)' : 'rgba(255, 60, 170, 0.15)'} 0%, transparent 70%)`,
              borderRadius: '50%',
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              filter: 'blur(8px)',
            }}
            animate={{
              y: [0, Math.random() * 50 - 25],
              x: [0, Math.random() * 50 - 25],
              scale: [1, 1 + Math.random() * 0.3],
            }}
            transition={{
              duration: 8 + Math.random() * 7,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: "easeInOut"
            }}
          />
        ))}
      </Box>

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <Grid container spacing={5} alignItems="center" justifyContent="space-between">
            <Grid xs={12} lg={6}>
              <Box sx={{ maxWidth: 650 }}>
                <motion.div variants={itemVariants}>
                  <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                    {platforms.map((platform, index) => (
                      <Chip
                        key={platform.name}
                        label={platform.name}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(60, 255, 220, 0.1)',
                          border: '1px solid rgba(60, 255, 220, 0.3)',
                          color: 'primary.main',
                          fontWeight: 500,
                          '&:hover': {
                            bgcolor: 'rgba(60, 255, 220, 0.2)',
                          }
                        }}
                      />
                    ))}
                  </Stack>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Typography
                    variant="h1"
                    component="h1"
                    className="neon-text"
                    sx={{
                      fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4.5rem' },
                      fontWeight: 800,
                      mb: 2,
                      lineHeight: 1.1,
                      letterSpacing: '-0.02em'
                    }}
                  >
                    <Box component="span" className="gradient-text">
                      短视频推广
                    </Box>
                    <br />
                    智能增长平台
                  </Typography>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Typography
                    variant="h2"
                    sx={{
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      fontWeight: 500,
                      mb: 3,
                      color: 'text.secondary',
                      maxWidth: '90%'
                    }}
                  >
                    为创作者提供一站式自助服务，让您的内容获得更好的曝光和互动
                  </Typography>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '1rem', md: '1.1rem' },
                      mb: 4,
                      maxWidth: '90%',
                      lineHeight: 1.6,
                      color: 'text.secondary'
                    }}
                  >
                    专注于为主流短视频平台内容创作者提供初期数据增长与曝光优化服务，
                    通过智能算法和精准投放，帮助您的内容快速获得更多曝光、点赞、评论和分享。
                  </Typography>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Stack direction="row" spacing={3} sx={{ mb: 5 }}>
                    {features.map((feature, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <Box
                          sx={{
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            color: 'text.primary'
                          }}
                        >
                          {feature.text}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{ mb: { xs: 8, md: 0 } }}
                  >
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        href="#service-form"
                        endIcon={<ArrowDownwardIcon />}
                        sx={{
                          py: 1.5,
                          px: 4,
                          fontSize: '1rem',
                          fontWeight: 600,
                          borderRadius: '8px',
                          boxShadow: '0 0 20px rgba(60, 255, 220, 0.4)'
                        }}
                        className="pulse-animation"
                      >
                        立即开始
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="large"
                        sx={{
                          py: 1.5,
                          px: 4,
                          fontSize: '1rem',
                          fontWeight: 600,
                          borderRadius: '8px',
                          borderWidth: 2
                        }}
                      >
                        了解更多
                      </Button>
                    </motion.div>
                  </Stack>
                </motion.div>
              </Box>
            </Grid>

            {!isTablet && (
              <Grid xs={12} lg={5}>
                <Box
                  sx={{
                    position: 'relative',
                    height: 600,
                    width: '100%',
                    perspective: '1000px'
                  }}
                >
                  {/* 3D Holographic Display */}
                  <motion.div
                    initial={{ opacity: 0, rotateY: -20 }}
                    animate={{
                      opacity: 1,
                      rotateY: 0,
                      transition: { duration: 1, delay: 0.5 }
                    }}
                  >
                    <Box
                      className="cyber-corner"
                      sx={{
                        position: 'absolute',
                        width: '80%',
                        height: '80%',
                        top: '10%',
                        left: '10%',
                        borderRadius: '20px',
                        background: 'rgba(5, 19, 38, 0.5)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(60, 255, 220, 0.3)',
                        boxShadow: '0 0 30px rgba(60, 255, 220, 0.2)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: 'rotateX(5deg) rotateY(-5deg)',
                        transformStyle: 'preserve-3d'
                      }}
                    >
                      {/* Circular rings */}
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={`ring-${i}`}
                          style={{
                            position: 'absolute',
                            width: `${70 - i * 15}%`,
                            height: `${70 - i * 15}%`,
                            borderRadius: '50%',
                            border: '1px solid rgba(60, 255, 220, 0.3)',
                          }}
                          animate={{
                            rotate: 360,
                            boxShadow: [
                              '0 0 10px rgba(60, 255, 220, 0.1)',
                              '0 0 20px rgba(60, 255, 220, 0.3)',
                              '0 0 10px rgba(60, 255, 220, 0.1)'
                            ]
                          }}
                          transition={{
                            duration: 20 + i * 5,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                        />
                      ))}

                      {/* Central sphere */}
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          boxShadow: [
                            '0 0 20px rgba(60, 255, 220, 0.3)',
                            '0 0 40px rgba(60, 255, 220, 0.5)',
                            '0 0 20px rgba(60, 255, 220, 0.3)'
                          ]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          repeatType: 'reverse',
                        }}
                        style={{
                          width: '30%',
                          height: '30%',
                          borderRadius: '50%',
                          background: 'radial-gradient(circle, rgba(60, 255, 220, 0.3) 0%, rgba(60, 255, 220, 0.1) 70%)',
                          border: '1px solid rgba(60, 255, 220, 0.5)',
                        }}
                      />

                      {/* Floating platform icons */}
                      {platforms.map((platform, i) => (
                        <motion.div
                          key={`platform-${i}`}
                          custom={i}
                          variants={floatingIconVariants}
                          initial="hidden"
                          animate="visible"
                          style={{
                            position: 'absolute',
                            padding: '12px 20px',
                            background: 'rgba(5, 19, 38, 0.8)',
                            border: '1px solid rgba(60, 255, 220, 0.3)',
                            borderRadius: '12px',
                            boxShadow: '0 0 15px rgba(60, 255, 220, 0.2)',
                            top: `${30 + Math.sin(i * Math.PI / 3) * 30}%`,
                            left: `${30 + Math.cos(i * Math.PI / 3) * 30}%`,
                            transform: 'translateZ(20px)',
                            transformStyle: 'preserve-3d'
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: 'primary.main'
                            }}
                          >
                            {platform.name}
                          </Typography>
                        </motion.div>
                      ))}

                      {/* Data visualization elements */}
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={`data-${i}`}
                          style={{
                            position: 'absolute',
                            width: '60%',
                            height: '4px',
                            borderRadius: '2px',
                            background: 'rgba(60, 255, 220, 0.1)',
                            bottom: `${25 + i * 8}%`,
                            left: '20%',
                          }}
                        >
                          <motion.div
                            style={{
                              height: '100%',
                              borderRadius: '2px',
                              background: 'linear-gradient(90deg, #3CFFDC 0%, rgba(60, 255, 220, 0.3) 100%)',
                              width: '0%',
                            }}
                            animate={{ width: `${30 + Math.random() * 70}%` }}
                            transition={{
                              duration: 2,
                              delay: i * 0.2,
                              ease: "easeOut"
                            }}
                          />
                        </motion.div>
                      ))}

                      {/* Animated particles */}
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={`particle-${i}`}
                          style={{
                            position: 'absolute',
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            background: i % 2 === 0 ? '#3CFFDC' : '#FF3CAA',
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                          }}
                          animate={{
                            y: [0, Math.random() * 100 - 50],
                            x: [0, Math.random() * 100 - 50],
                            opacity: [1, 0.5, 1],
                          }}
                          transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            repeatType: 'reverse',
                          }}
                        />
                      ))}
                    </Box>
                  </motion.div>

                  {/* Floating stats cards */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.8, delay: 0.8 }
                    }}
                    style={{
                      position: 'absolute',
                      bottom: '5%',
                      left: '0%',
                    }}
                  >
                    <Box
                      className="glass-panel"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        width: 180,
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <Typography variant="overline" color="primary.main" fontWeight="bold">
                        互动率
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" className="gradient-text">
                        +147%
                      </Typography>
                      <Box className="data-bar" sx={{ mt: 1 }}>
                        <Box className="data-bar-fill" sx={{ width: '80%' }} />
                      </Box>
                    </Box>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.8, delay: 1 }
                    }}
                    style={{
                      position: 'absolute',
                      bottom: '25%',
                      right: '5%',
                    }}
                  >
                    <Box
                      className="glass-panel"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        width: 180,
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <Typography variant="overline" color="primary.main" fontWeight="bold">
                        曝光量
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" className="gradient-text">
                        +283%
                      </Typography>
                      <Box className="data-bar" sx={{ mt: 1 }}>
                        <Box className="data-bar-fill" sx={{ width: '95%' }} />
                      </Box>
                    </Box>
                  </motion.div>
                </Box>
              </Grid>
            )}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Hero;
