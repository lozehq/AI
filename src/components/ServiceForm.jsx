import React, { useState, useEffect } from 'react';
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

// 导入自定义组件
import ServiceSelectionCard from './ServiceSelectionCard';
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
  // 初始化选中的服务
  const [selectedServices, setSelectedServices] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  // 加载用户信息
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch (err) {
        console.error('Failed to parse user data:', err);
      }
    }
  }, []);

  // 初始化选中的服务
  useEffect(() => {
    // 初始化默认服务
    const defaultServices = {
      views: 0,
      likes: 0,
      completionRate: 0,
      shares: 0,
      saves: 0
    };

    // 从localStorage获取自定义服务
    try {
      const servicesData = localStorage.getItem('services');
      if (servicesData) {
        const services = JSON.parse(servicesData);
        // 将服务添加到默认服务对象中
        Object.keys(services).forEach(key => {
          defaultServices[key] = 0;
        });
      }
    } catch (error) {
      console.error('加载服务数据失败:', error);
    }

    setSelectedServices(defaultServices);
  }, []);
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState('');
  const [orderCreated, setOrderCreated] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);

  // 从localStorage获取服务价格
  const [pricing, setPricing] = useState({
    views: 0.1,
    likes: 0.2,
    completionRate: 0.3,
    shares: 0.2,
    saves: 0.2
  });

  // 存储服务数据
  const [servicesData, setServicesData] = useState({});

  // 获取服务的最小购买量
  const getServiceMinPurchase = (key) => {
    if (servicesData[key] && servicesData[key].minPurchase !== undefined) {
      return servicesData[key].minPurchase;
    }
    return 1; // 默认最小购买量为1
  };

  // 获取服务的最大购买量
  const getServiceMaxPurchase = (key) => {
    if (servicesData[key] && servicesData[key].maxPurchase !== undefined) {
      return servicesData[key].maxPurchase;
    }
    return 0; // 默认最大购买量为0（无限制）
  };

  // 在组件加载时获取服务数据
  useEffect(() => {
    // 从localStorage获取服务数据
    const loadServices = () => {
      try {
        const servicesDataStr = localStorage.getItem('services');
        if (servicesDataStr) {
          const services = JSON.parse(servicesDataStr);
          const newPricing = { ...pricing };

          // 更新价格
          Object.entries(services).forEach(([key, service]) => {
            if (service.price !== undefined) {
              newPricing[key] = parseFloat(service.price);
            }
          });

          setPricing(newPricing);
          setServicesData(services);
          console.log('已加载服务数据:', services);
        }
      } catch (error) {
        console.error('加载服务数据失败:', error);
      }
    };

    loadServices();
  }, []);

  // Platform detection
  const handleUrlChange = (e) => {
    setVideoUrl(e.target.value);
    setError('');
    setDetectedPlatform(null);
  };

  const handleDetectPlatform = () => {
    // 清除之前的错误
    setError('');

    // 验证链接
    if (!videoUrl || videoUrl.trim() === '') {
      setError('请输入视频链接');
      return;
    }

    // 设置加载状态
    setIsDetecting(true);

    // 使用超时模拟异步请求
    setTimeout(() => {
      try {
        // 尝试检测平台
        const platform = detectPlatform(videoUrl.trim());

        // 更新状态
        setDetectedPlatform(platform);
        setIsDetecting(false);

        if (platform) {
          // 如果成功检测到平台，进入下一步
          setActiveStep(1);
        } else {
          // 如果无法检测平台
          setError('无法识别平台，请检查链接是否正确或手动选择平台');

          // 尝试从链接中提取关键词来猜测平台
          const lowerUrl = videoUrl.toLowerCase();
          if (lowerUrl.includes('douyin') || lowerUrl.includes('tiktok')) {
            setDetectedPlatform('douyin');
            setError('已自动选择抖音平台，请确认是否正确');
            setActiveStep(1);
          } else if (lowerUrl.includes('xiaohongshu') || lowerUrl.includes('xhs')) {
            setDetectedPlatform('xiaohongshu');
            setError('已自动选择小红书平台，请确认是否正确');
            setActiveStep(1);
          } else if (lowerUrl.includes('bilibili') || lowerUrl.includes('b23')) {
            setDetectedPlatform('bilibili');
            setError('已自动选择哔哩哔哩平台，请确认是否正确');
            setActiveStep(1);
          }
        }
      } catch (err) {
        console.error('链接检测错误:', err);
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
    try {
      if (!services || typeof services !== 'object') {
        console.error('无效的服务对象:', services);
        setTotalPrice(0);
        return;
      }

      let total = 0;
      for (const [service, amount] of Object.entries(services)) {
        // 确保数量是数字
        const numAmount = Number(amount);
        if (!isNaN(numAmount) && numAmount > 0 && pricing[service]) {
          total += numAmount * pricing[service];
        }
      }

      // 保留两位小数
      setTotalPrice(parseFloat(total.toFixed(2)));
    } catch (error) {
      console.error('计算总价错误:', error);
      setTotalPrice(0);
    }
  };

  // 处理订单创建
  const handleCreateNewOrder = () => {
    try {
      // 检查是否有选择服务
      const hasSelectedServices = Object.values(selectedServices).some(value => value > 0);
      if (!hasSelectedServices) {
        setError('请至少选择一项服务');
        return;
      }

      // 检查平台是否有效
      if (!detectedPlatform) {
        setError('无法识别平台，请重新输入链接');
        return;
      }

      // 检查URL是否有效
      if (!videoUrl || videoUrl.trim() === '') {
        setError('请输入有效的链接');
        return;
      }

      // 过滤掉数量为0的服务
      const filteredServices = {};
      for (const [key, value] of Object.entries(selectedServices)) {
        if (value > 0) {
          filteredServices[key] = value;
        }
      }

      // 检查用户是否登录
      if (!currentUser || !currentUser.id) {
        setError('请先登录再创建订单');
        return;
      }

      // 创建订单
      const order = createOrder(detectedPlatform, filteredServices, videoUrl, currentUser.id);

      if (!order || !order.orderId) {
        throw new Error('订单创建失败，返回的订单数据无效');
      }

      setCreatedOrderId(order.orderId);
      setOrderCreated(true);

      // 进入下一步
      setActiveStep((prevStep) => prevStep + 1);
    } catch (error) {
      console.error('创建订单失败:', error);
      setError('创建订单失败，请重试: ' + (error.message || ''));
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
    // 默认服务
    const commonServices = {
      views: '播放量',
      likes: '点赞数',
      shares: '分享数',
      saves: '收藏量'
    };

    // 从localStorage获取自定义服务
    let customServices = {};
    try {
      const servicesData = localStorage.getItem('services');
      if (servicesData) {
        const services = JSON.parse(servicesData);
        // 将服务添加到自定义服务对象中
        Object.entries(services).forEach(([key, service]) => {
          customServices[key] = service.name;
        });
        console.log('已加载自定义服务:', customServices);
      }
    } catch (error) {
      console.error('加载自定义服务失败:', error);
    }

    // 合并默认服务和自定义服务
    const mergedServices = { ...commonServices, ...customServices };

    // 根据平台返回特定服务
    switch (platform) {
      case 'douyin':
        return { ...mergedServices, completionRate: '完播率' };
      case 'xiaohongshu':
        return { ...mergedServices, comments: '评论数' };
      case 'bilibili':
        return { ...mergedServices, completionRate: '完播率', coins: '投币数' };
      case 'kuaishou':
        return { ...mergedServices, completionRate: '完播率' };
      case 'wechat':
        return { ...mergedServices, reads: '阅读量' };
      default:
        return mergedServices;
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
                  mb: 3
                }}
              >
                为您的 <Box component="span" sx={{ color: 'secondary.main', fontWeight: 'bold' }}>{platformNames[detectedPlatform]}</Box> 内容选择需要的推广服务
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 2,
                  mb: 4
                }}
              >
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

                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    bgcolor: 'rgba(60, 158, 255, 0.1)',
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    border: '1px solid rgba(60, 158, 255, 0.2)',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#3C9EFF' }}>
                    平台: {platformNames[detectedPlatform]}
                  </Typography>
                </Box>
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

            <Grid container spacing={3} sx={{ maxWidth: 1200, mx: 'auto' }}>
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

                return (
                  <Grid key={key} size={{ xs: 12, sm: 6, md: 4 }} sx={{ mb: 3 }}>
                    <ServiceSelectionCard
                      serviceKey={key}
                      serviceLabel={label}
                      value={selectedServices[key] || 0}
                      onChange={handleServiceChange}
                      color={color}
                      pricing={pricing}
                      platform={detectedPlatform}
                      minPurchase={getServiceMinPurchase(key)}
                      maxPurchase={getServiceMaxPurchase(key)}
                    />
                  </Grid>
                );
              })}
            </Grid>

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
