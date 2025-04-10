import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  Divider,
  Chip,
  Alert,
  Paper,
  Slider,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';
import { useNavigate } from 'react-router-dom';

// Import utility functions
import { detectPlatform } from '../utils/platformDetector';
import { createOrder } from '../services/orderService';

const ServiceForm = () => {
  const navigate = useNavigate();

  // Form state
  const [activeStep, setActiveStep] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedServices, setSelectedServices] = useState({
    views: 0,
    likes: 0,
    completionRate: 0,
    shares: 0,
    saves: 0
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState('');
  const [orderCreated, setOrderCreated] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  // Service pricing (in Yuan per unit)
  const pricing = {
    views: 0.1,
    likes: 0.2,
    completionRate: 0.3,
    shares: 0.2,
    saves: 0.2
  };

  // Platform detection
  const handleUrlChange = (e) => {
    setVideoUrl(e.target.value);
    setError('');
    setDetectedPlatform(null);
  };

  const handleDetectPlatform = () => {
    if (!videoUrl) {
      setError('请输入视频链接');
      return;
    }

    setIsDetecting(true);

    // Simulate API call with setTimeout
    setTimeout(() => {
      try {
        const platform = detectPlatform(videoUrl);
        setDetectedPlatform(platform);
        setIsDetecting(false);

        if (platform) {
          setActiveStep(1);
        } else {
          setError('无法识别平台，请检查链接是否正确');
        }
      } catch (err) {
        setError('链接格式错误，请输入有效的视频链接');
        setIsDetecting(false);
      }
    }, 1500);
  };

  // Service selection handlers
  const handleServiceChange = (service, value) => {
    setSelectedServices({
      ...selectedServices,
      [service]: value
    });

    // Recalculate total price
    calculateTotalPrice({
      ...selectedServices,
      [service]: value
    });
  };

  const calculateTotalPrice = (services) => {
    let total = 0;
    for (const [service, amount] of Object.entries(services)) {
      total += amount * pricing[service];
    }
    setTotalPrice(total);
  };

  // 处理订单创建
  const handleCreateNewOrder = () => {
    try {
      // 过滤掉数量为0的服务
      const filteredServices = {};
      for (const [key, value] of Object.entries(selectedServices)) {
        if (value > 0) {
          filteredServices[key] = value;
        }
      }

      // 创建订单
      const order = createOrder(detectedPlatform, filteredServices, videoUrl);
      setCreatedOrderId(order.orderId);
      setOrderCreated(true);

      // 进入下一步
      setActiveStep((prevStep) => prevStep + 1);
    } catch (error) {
      console.error('创建订单失败:', error);
      setError('创建订单失败，请重试');
    }
  };

  // Step navigation
  const handleNext = () => {
    if (activeStep === 0 && !detectedPlatform) {
      handleDetectPlatform();
      return;
    }

    if (activeStep === 1 && totalPrice === 0) {
      setError('请至少选择一项服务');
      return;
    }

    if (activeStep === 2) {
      handleCreateNewOrder();
      return;
    }

    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Platform-specific service options
  const getPlatformServices = (platform) => {
    const commonServices = {
      views: '播放量',
      likes: '点赞数',
      shares: '分享数',
      saves: '收藏量'
    };

    switch (platform) {
      case 'douyin':
        return { ...commonServices, completionRate: '完播率' };
      case 'xiaohongshu':
        return { ...commonServices, comments: '评论数' };
      case 'bilibili':
        return { ...commonServices, completionRate: '完播率', coins: '投币数' };
      case 'kuaishou':
        return { ...commonServices, completionRate: '完播率' };
      case 'wechat':
        return { ...commonServices, reads: '阅读量' };
      default:
        return commonServices;
    }
  };

  // Platform display names
  const platformNames = {
    douyin: '抖音',
    xiaohongshu: '小红书',
    bilibili: '哔哩哔哩',
    kuaishou: '快手',
    wechat: '微信公众号/视频号'
  };

  // Steps content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              输入您的视频链接
            </Typography>

            <Box sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
              <TextField
                fullWidth
                label="视频链接"
                variant="outlined"
                value={videoUrl}
                onChange={handleUrlChange}
                placeholder="粘贴抖音/小红书/B站/快手/公众号/视频号链接"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
                error={!!error}
                helperText={error}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, maxWidth: 800, mx: 'auto' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDetectPlatform}
                disabled={isDetecting}
                sx={{ minWidth: 200 }}
              >
                {isDetecting ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                    识别中...
                  </>
                ) : '识别平台'}
              </Button>
            </Box>

            {detectedPlatform && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                style={{ maxWidth: 800, margin: '0 auto' }}
              >
                <Alert
                  icon={<CheckCircleOutlineIcon fontSize="inherit" />}
                  severity="success"
                  sx={{ mt: 3 }}
                >
                  已识别为 <strong>{platformNames[detectedPlatform]}</strong> 平台的链接
                </Alert>
              </motion.div>
            )}
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  fontFamily: 'Orbitron',
                  fontWeight: 'bold',
                  background: 'linear-gradient(90deg, #3CFFDC, #3C9EFF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 20px rgba(60, 255, 220, 0.4)',
                  mb: 1
                }}
              >
                选择推广服务
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  maxWidth: 600,
                  mx: 'auto',
                  fontSize: '1.1rem',
                  mb: 1
                }}
              >
                为您的 <Box component="span" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>{platformNames[detectedPlatform]}</Box> 内容选择需要的推广服务
              </Typography>

              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  bgcolor: 'rgba(60, 255, 220, 0.1)',
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  border: '1px solid rgba(60, 255, 220, 0.2)',
                }}
              >
                <Typography variant="body2" color="primary.main">
                  单价: ¥0.1/互动量
                </Typography>
              </Box>
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  maxWidth: 800,
                  mx: 'auto',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 77, 106, 0.3)'
                }}
              >
                {error}
              </Alert>
            )}

            <Box
              sx={{
                maxWidth: 900,
                mx: 'auto',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -20,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '80%',
                  height: '1px',
                  background: 'linear-gradient(90deg, rgba(60, 255, 220, 0) 0%, rgba(60, 255, 220, 0.5) 50%, rgba(60, 255, 220, 0) 100%)',
                  boxShadow: '0 0 10px rgba(60, 255, 220, 0.5)'
                }
              }}
            >
              {Object.entries(getPlatformServices(detectedPlatform)).map(([key, label], index) => {
                // 为每个服务选择不同的颜色
                const colors = {
                  views: { main: '#3CFFDC', light: 'rgba(60, 255, 220, 0.2)' },
                  likes: { main: '#FF3CAA', light: 'rgba(255, 60, 170, 0.2)' },
                  shares: { main: '#3C9EFF', light: 'rgba(60, 158, 255, 0.2)' },
                  comments: { main: '#FFAA3C', light: 'rgba(255, 170, 60, 0.2)' },
                  completionRate: { main: '#3CFF88', light: 'rgba(60, 255, 136, 0.2)' },
                  saves: { main: '#A03CFF', light: 'rgba(160, 60, 255, 0.2)' },
                  followers: { main: '#FF3C3C', light: 'rgba(255, 60, 60, 0.2)' },
                  coins: { main: '#FFD700', light: 'rgba(255, 215, 0, 0.2)' },
                  reads: { main: '#00D6B4', light: 'rgba(0, 214, 180, 0.2)' }
                };

                const color = colors[key] || colors.views;
                const isActive = selectedServices[key] > 0;

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Paper
                      elevation={isActive ? 6 : 2}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        mb: 3,
                        background: `linear-gradient(135deg, rgba(5, 19, 38, 0.9), rgba(2, 8, 16, 0.95))`,
                        border: isActive ? `1px solid ${color.main}` : '1px solid rgba(60, 255, 220, 0.1)',
                        boxShadow: isActive ? `0 0 20px ${color.light}` : 'none',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::after': isActive ? {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '5px',
                          height: '100%',
                          background: `linear-gradient(to bottom, ${color.main}, transparent)`,
                          boxShadow: `0 0 10px ${color.light}`
                        } : {}
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: `linear-gradient(135deg, ${color.light}, transparent)`,
                              border: `1px solid ${color.main}`,
                              mr: 2,
                              boxShadow: isActive ? `0 0 10px ${color.light}` : 'none',
                            }}
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                color: color.main,
                                fontFamily: 'Orbitron',
                                fontWeight: 'bold'
                              }}
                            >
                              {index + 1}
                            </Typography>
                          </Box>
                          <Typography
                            variant="h6"
                            sx={{
                              fontFamily: 'Orbitron',
                              fontWeight: 'medium',
                              color: isActive ? color.main : 'text.primary',
                              textShadow: isActive ? `0 0 10px ${color.light}` : 'none'
                            }}
                          >
                            {label}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{
                              fontFamily: 'Orbitron',
                              color: isActive ? color.main : 'text.secondary',
                              textShadow: isActive ? `0 0 10px ${color.light}` : 'none',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {selectedServices[key] > 0 ?
                              `¥${(selectedServices[key] * pricing[key]).toFixed(2)}` :
                              '未选择'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ position: 'relative', mt: 3, mb: 1 }}>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -25,
                            left: 0,
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between',
                            px: 1
                          }}
                        >
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>0</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {key === 'completionRate' ? '100%' : '10,000'}
                          </Typography>
                        </Box>

                        <Slider
                          value={selectedServices[key] || 0}
                          onChange={(e, newValue) => handleServiceChange(key, newValue)}
                          step={key === 'completionRate' ? 5 : 100}
                          min={0}
                          max={key === 'completionRate' ? 100 : 10000}
                          valueLabelDisplay="auto"
                          valueLabelFormat={(value) => key === 'completionRate' ? `${value}%` : value.toLocaleString()}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            '& .MuiSlider-rail': {
                              opacity: 0.5,
                              backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                            '& .MuiSlider-track': {
                              border: 'none',
                              background: `linear-gradient(90deg, ${color.main} 0%, ${color.light} 100%)`,
                              boxShadow: isActive ? `0 0 10px ${color.light}` : 'none',
                            },
                            '& .MuiSlider-thumb': {
                              height: 24,
                              width: 24,
                              backgroundColor: '#051326',
                              border: `2px solid ${color.main}`,
                              boxShadow: isActive ? `0 0 10px ${color.light}` : 'none',
                              '&:focus, &:hover, &.Mui-active': {
                                boxShadow: `0 0 15px ${color.main}`,
                              },
                            },
                            '& .MuiSlider-valueLabel': {
                              background: `linear-gradient(135deg, rgba(5, 19, 38, 0.9), rgba(2, 8, 16, 0.95))`,
                              border: `1px solid ${color.main}`,
                              borderRadius: 1,
                              boxShadow: `0 0 10px ${color.light}`,
                              padding: '5px 10px',
                              fontFamily: 'Orbitron',
                              fontWeight: 'bold',
                              '&::before': {
                                display: 'none'
                              }
                            }
                          }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                            当前数值:
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color: isActive ? color.main : 'text.primary',
                              fontWeight: 'bold',
                              fontFamily: 'Orbitron',
                            }}
                          >
                            {(selectedServices[key] || 0).toLocaleString()}{key === 'completionRate' ? '%' : ''}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          单价: <Box component="span" sx={{ color: color.main }}>¥{pricing[key]}</Box>/{key === 'completionRate' ? '%' : '个'}
                        </Typography>
                      </Box>
                    </Paper>
                  </motion.div>
                );
              })}
            </Box>

            {/* 总价格显示 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Box sx={{
                mt: 4,
                p: 4,
                borderRadius: 3,
                maxWidth: 900,
                mx: 'auto',
                background: 'linear-gradient(135deg, rgba(5, 19, 38, 0.8), rgba(2, 8, 16, 0.9))',
                border: totalPrice > 0 ? '1px solid rgba(60, 255, 220, 0.5)' : '1px solid rgba(60, 255, 220, 0.1)',
                boxShadow: totalPrice > 0 ? '0 0 30px rgba(60, 255, 220, 0.2)' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(60, 255, 220, 0.5), transparent)' }} />
                <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(60, 255, 220, 0.5), transparent)' }} />

                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Orbitron',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'rgba(60, 255, 220, 0.1)',
                      border: '1px solid rgba(60, 255, 220, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                      color: 'primary.main'
                    }}
                  >
                    <ShoppingCartIcon />
                  </Box>
                  总计金额
                </Typography>

                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: 'Orbitron',
                    fontWeight: 'bold',
                    color: totalPrice > 0 ? 'primary.main' : 'text.secondary',
                    textShadow: totalPrice > 0 ? '0 0 20px rgba(60, 255, 220, 0.5)' : 'none',
                  }}
                >
                  ¥{totalPrice.toFixed(2)}
                </Typography>
              </Box>
            </motion.div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              确认订单
            </Typography>

            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  订单详情
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    平台:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {platformNames[detectedPlatform]}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    链接:
                  </Typography>
                  <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
                    {videoUrl}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body1" fontWeight="medium" gutterBottom>
                  已选服务:
                </Typography>

                {Object.entries(selectedServices).map(([key, value]) => {
                  if (value > 0) {
                    const serviceLabel = getPlatformServices(detectedPlatform)[key];
                    return (
                      <Box
                        key={key}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 1
                        }}
                      >
                        <Typography variant="body2">
                          {serviceLabel}: {key === 'completionRate' ? `${value}%` : value}
                        </Typography>
                        <Typography variant="body2">
                          ¥{(value * pricing[key]).toFixed(2)}
                        </Typography>
                      </Box>
                    );
                  }
                  return null;
                })}

                <Divider sx={{ my: 2 }} />

                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant="h6">
                    总价:
                  </Typography>
                  <Typography variant="h5" color="primary.main" fontWeight="bold">
                    ¥{totalPrice.toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Typography variant="h6" gutterBottom>
              选择支付方式
            </Typography>

            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <RadioGroup defaultValue="wechat">
                <FormControlLabel
                  value="wechat"
                  control={<Radio />}
                  label="微信支付"
                />
                <FormControlLabel
                  value="alipay"
                  control={<Radio />}
                  label="支付宝"
                />
              </RadioGroup>
            </FormControl>

            <FormControlLabel
              control={<Checkbox defaultChecked />}
              label="我同意服务条款和隐私政策"
            />
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center' }}
          >
            <Box sx={{ mb: 4 }}>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                <CheckCircleOutlineIcon
                  sx={{
                    fontSize: 100,
                    color: 'primary.main',
                    mb: 2
                  }}
                />
              </motion.div>

              <Typography variant="h4" gutterBottom>
                订单已提交
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                您的订单已成功提交，我们将立即开始处理
              </Typography>

              <Alert severity="info" sx={{ mb: 3, mx: 'auto', maxWidth: 500 }}>
                订单编号: <strong>{createdOrderId}</strong>
              </Alert>

              <Typography variant="body1" sx={{ mb: 4 }}>
                您可以在个人中心查看订单进度
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/orders')}
                >
                  查看订单
                </Button>

                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate('/')}
                >
                  返回首页
                </Button>
              </Box>
            </Box>
          </motion.div>
        );

      default:
        return 'Unknown step';
    }
  };

  // Step labels
  const steps = ['输入链接', '选择服务', '确认订单', '完成'];

  return (
    <Box
      id="service-form"
      sx={{
        py: 8,
        background: 'linear-gradient(to bottom, rgba(5, 11, 31, 0.8), rgba(10, 18, 41, 0.9))',
        borderTop: '1px solid rgba(0, 240, 255, 0.2)',
        borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
      }}
    >
      <Container maxWidth="lg"> {/* 增大容器宽度，提供更好的桌面体验 */}
        <Box sx={{ textAlign: 'center', mb: 5, position: 'relative' }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Typography
              variant="h3"
              component="h2"
              sx={{
                fontFamily: 'Orbitron',
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, #3CFFDC, #3C9EFF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 20px rgba(60, 255, 220, 0.4)',
                mb: 1,
                position: 'relative',
                display: 'inline-block',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '25%',
                  width: '50%',
                  height: '2px',
                  background: 'linear-gradient(90deg, rgba(60, 255, 220, 0), rgba(60, 255, 220, 1), rgba(60, 255, 220, 0))',
                  boxShadow: '0 0 10px rgba(60, 255, 220, 0.7)'
                }
              }}
            >
              开始推广您的内容
            </Typography>
          </motion.div>
        </Box>

        <Card
          className="glass-panel"
          sx={{
            p: { xs: 2, md: 4 },
            mb: 4,
            borderRadius: 3,
            maxWidth: 1200,
            mx: 'auto',
            background: 'linear-gradient(135deg, rgba(5, 19, 38, 0.8), rgba(2, 8, 16, 0.9))',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(60, 255, 220, 0.2)',
            boxShadow: '0 0 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(60, 255, 220, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'radial-gradient(circle at 30% 20%, rgba(60, 255, 220, 0.05) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255, 60, 170, 0.05) 0%, transparent 50%)',
              pointerEvents: 'none'
            }
          }}
        >
          <CardContent>
            <Box sx={{ mb: 5, position: 'relative' }}>
              {/* 自定义步骤指示器 */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  position: 'relative',
                  maxWidth: 800,
                  mx: 'auto',
                  px: 4,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: '2px',
                    transform: 'translateY(-50%)',
                    background: 'rgba(60, 255, 220, 0.1)',
                    zIndex: 0
                  }
                }}
              >
                {steps.map((label, index) => {
                  // 确定步骤状态
                  const isCompleted = index < activeStep;
                  const isActive = index === activeStep;
                  const isPending = index > activeStep;

                  // 根据状态选择颜色
                  let color = 'rgba(255, 255, 255, 0.3)';
                  let bgColor = 'rgba(255, 255, 255, 0.05)';
                  let borderColor = 'rgba(255, 255, 255, 0.1)';
                  let shadow = 'none';

                  if (isActive) {
                    color = '#FF3CAA';
                    bgColor = 'rgba(255, 60, 170, 0.1)';
                    borderColor = 'rgba(255, 60, 170, 0.5)';
                    shadow = '0 0 15px rgba(255, 60, 170, 0.3)';
                  } else if (isCompleted) {
                    color = '#3CFFDC';
                    bgColor = 'rgba(60, 255, 220, 0.1)';
                    borderColor = 'rgba(60, 255, 220, 0.5)';
                    shadow = '0 0 15px rgba(60, 255, 220, 0.3)';
                  }

                  return (
                    <Box key={label} sx={{ zIndex: 1, textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: bgColor,
                          border: `2px solid ${borderColor}`,
                          boxShadow: shadow,
                          mb: 1,
                          position: 'relative',
                          mx: 'auto',
                          transition: 'all 0.3s ease',
                          '&::before': isCompleted ? {
                            content: '"✓"',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: '#3CFFDC',
                            fontWeight: 'bold',
                            fontSize: '1.5rem'
                          } : {}
                        }}
                      >
                        {!isCompleted && (
                          <Typography
                            variant="h6"
                            sx={{
                              color,
                              fontFamily: 'Orbitron',
                              fontWeight: 'bold'
                            }}
                          >
                            {index + 1}
                          </Typography>
                        )}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color,
                          fontFamily: 'Orbitron',
                          fontWeight: isActive ? 'bold' : 'medium',
                          fontSize: isActive ? '0.9rem' : '0.8rem',
                          textShadow: isActive ? `0 0 10px ${color}` : 'none',
                        }}
                      >
                        {label}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {getStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  disabled={activeStep === 0 || activeStep === 3}
                  onClick={handleBack}
                  sx={{
                    display: activeStep === 0 || activeStep === 3 ? 'none' : 'block',
                    px: 3,
                    py: 1.2,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                    }
                  }}
                  startIcon={<Box sx={{ mr: 1 }}>←</Box>}
                >
                  上一步
                </Button>
              </motion.div>

              {activeStep < 3 && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    color={activeStep === 2 ? 'secondary' : 'primary'}
                    onClick={handleNext}
                    startIcon={activeStep === 2 ? <PaymentIcon /> : null}
                    endIcon={activeStep === 1 ? <ShoppingCartIcon /> : activeStep === 0 ? <Box sx={{ ml: 1 }}>→</Box> : null}
                    sx={{
                      px: 3,
                      py: 1.2,
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      boxShadow: activeStep === 2
                        ? '0 0 20px rgba(255, 60, 170, 0.4)'
                        : '0 0 20px rgba(60, 255, 220, 0.4)',
                    }}
                  >
                    {activeStep === 2 ? '确认支付' : activeStep === 1 ? '去结算' : '下一步'}
                  </Button>
                </motion.div>
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ServiceForm;
