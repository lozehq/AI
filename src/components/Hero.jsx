import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const Hero = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <Box 
      className="hero-container grid-lines"
      sx={{ 
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Animated background elements */}
      <Box 
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          overflow: 'hidden'
        }}
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              background: 'radial-gradient(circle, rgba(0, 240, 255, 0.4) 0%, rgba(0, 240, 255, 0) 70%)',
              borderRadius: '50%',
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.1 + Math.random() * 0.2,
            }}
            animate={{
              y: [0, Math.random() * 30 - 15],
              x: [0, Math.random() * 30 - 15],
              scale: [1, 1 + Math.random() * 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </Box>

      <Container maxWidth="lg">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <motion.div variants={itemVariants}>
                <Typography 
                  variant="h1" 
                  component="h1" 
                  className="glow-text"
                  sx={{ 
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                    fontWeight: 800,
                    mb: 2,
                    background: 'linear-gradient(90deg, #00f0ff, #00a6ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  短视频推广服务平台
                </Typography>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    fontWeight: 600,
                    mb: 3,
                    color: 'secondary.main'
                  }}
                >
                  一站式自助服务平台
                </Typography>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    mb: 4,
                    maxWidth: '90%',
                    lineHeight: 1.6
                  }}
                >
                  专注于为主流短视频平台（抖音、小红书、公众号、视频号、哔哩哔哩、快手）内容创作者和营销人员提供初期数据增长与曝光优化的服务，帮助您的内容获得更好的初始分发表现。
                </Typography>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
                        fontSize: '1.1rem'
                      }}
                    >
                      立即开始
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outlined" 
                      color="secondary"
                      size="large"
                      sx={{ 
                        py: 1.5, 
                        px: 4,
                        fontSize: '1.1rem',
                        borderWidth: 2
                      }}
                    >
                      了解更多
                    </Button>
                  </motion.div>
                </Box>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="float-animation"
              >
                <Box 
                  sx={{ 
                    position: 'relative',
                    width: '100%',
                    height: '400px',
                  }}
                >
                  {/* Futuristic 3D visualization (placeholder) */}
                  <Box 
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: '20px',
                      background: 'radial-gradient(circle, rgba(255, 0, 228, 0.1) 0%, rgba(0, 240, 255, 0.1) 100%)',
                      border: '2px solid rgba(0, 240, 255, 0.3)',
                      boxShadow: '0 0 30px rgba(0, 240, 255, 0.3), inset 0 0 30px rgba(255, 0, 228, 0.2)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Animated elements inside the visualization */}
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        style={{
                          position: 'absolute',
                          width: '60%',
                          height: '60%',
                          borderRadius: '50%',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          top: '20%',
                          left: '20%',
                        }}
                        animate={{
                          rotate: 360,
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 10 + i * 5,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                    ))}
                    
                    {/* Platform icons */}
                    {['抖音', '小红书', 'B站', '快手', '公众号', '视频号'].map((platform, i) => (
                      <motion.div
                        key={platform}
                        style={{
                          position: 'absolute',
                          padding: '10px 15px',
                          background: 'rgba(10, 18, 41, 0.8)',
                          border: '1px solid rgba(0, 240, 255, 0.5)',
                          borderRadius: '8px',
                          color: '#fff',
                          fontWeight: 'bold',
                          boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
                          top: `${20 + Math.sin(i * Math.PI / 3) * 35}%`,
                          left: `${20 + Math.cos(i * Math.PI / 3) * 35}%`,
                        }}
                        animate={{
                          y: [0, 10, 0],
                          boxShadow: [
                            '0 0 10px rgba(0, 240, 255, 0.5)',
                            '0 0 20px rgba(0, 240, 255, 0.8)',
                            '0 0 10px rgba(0, 240, 255, 0.5)',
                          ]
                        }}
                        transition={{
                          duration: 3 + i,
                          repeat: Infinity,
                          repeatType: 'reverse',
                        }}
                      >
                        {platform}
                      </motion.div>
                    ))}
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Hero;
