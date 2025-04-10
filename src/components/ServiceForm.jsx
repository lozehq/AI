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
  Stepper,
  Step,
  StepLabel,
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

// Import utility functions
import { detectPlatform } from '../utils/platformDetector';

const ServiceForm = () => {
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
            <Typography variant="h5" gutterBottom sx={{ mb: 1 }}>
              选择推广服务
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              为您的 {platformNames[detectedPlatform]} 内容选择需要的推广服务
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ maxWidth: 800, mx: 'auto' }}> {/* 限制宽度并居中 */}
              {Object.entries(getPlatformServices(detectedPlatform)).map(([key, label]) => (
                <Paper
                  key={key}
                  elevation={3}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    mb: 3, /* 垂直间距 */
                    border: selectedServices[key] > 0 ? '1px solid rgba(0, 240, 255, 0.5)' : 'none',
                    boxShadow: selectedServices[key] > 0 ? '0 0 15px rgba(0, 240, 255, 0.3)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {label}
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      {selectedServices[key] > 0 ?
                        `¥${(selectedServices[key] * pricing[key]).toFixed(2)}` :
                        '未选择'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1, minWidth: 80 }}>
                      当前数值:
                    </Typography>
                    <Typography variant="body1" color="primary.main" fontWeight="bold">
                      {selectedServices[key]}{key === 'completionRate' ? '%' : ''}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', mr: 2 }}>
                      <Slider
                        value={selectedServices[key] || 0}
                        onChange={(e, newValue) => handleServiceChange(key, newValue)}
                        step={key === 'completionRate' ? 5 : 100}
                        marks
                        min={0}
                        max={key === 'completionRate' ? 100 : 10000}
                        valueLabelDisplay="auto"
                        sx={{
                          color: 'primary.main',
                          '& .MuiSlider-thumb': {
                            boxShadow: '0 0 10px rgba(0, 240, 255, 0.7)',
                          },
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100, textAlign: 'right' }}>
                      单价: ¥{pricing[key]}/{key === 'completionRate' ? '%' : '个'}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>

            {/* 总价格显示 */}
            <Box sx={{
              mt: 4,
              p: 3,
              borderRadius: 2,
              maxWidth: 800,
              mx: 'auto',
              bgcolor: 'rgba(0, 240, 255, 0.05)',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h6">
                总计
              </Typography>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                ¥{totalPrice.toFixed(2)}
              </Typography>
            </Box>

            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 4,
              p: 2,
              borderRadius: 2,
              background: 'rgba(0, 240, 255, 0.05)',
              border: '1px solid rgba(0, 240, 255, 0.2)'
            }}>
              <Typography variant="h6">
                总价:
              </Typography>
              <Typography variant="h5" color="primary.main" fontWeight="bold">
                ¥{totalPrice.toFixed(2)}
              </Typography>
            </Box>
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
                订单编号: <strong>ORD-{Math.floor(Math.random() * 1000000)}</strong>
              </Alert>

              <Typography variant="body1" sx={{ mb: 4 }}>
                您可以在个人中心查看订单进度
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  href="/dashboard"
                >
                  查看订单
                </Button>

                <Button
                  variant="outlined"
                  color="secondary"
                  href="/"
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
        <Typography
          variant="h4"
          component="h2"
          align="center"
          gutterBottom
          sx={{
            mb: 5,
            color: 'primary.main',
            textShadow: '0 0 10px rgba(0, 240, 255, 0.5)'
          }}
        >
          开始推广您的内容
        </Typography>

        <Card
          className="glass-panel"
          sx={{
            p: { xs: 2, md: 4 },
            mb: 4,
            borderRadius: 3,
            maxWidth: 1200,
            mx: 'auto'
          }}
        >
          <CardContent>
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              sx={{
                mb: 5,
                '& .MuiStepLabel-root .Mui-completed': {
                  color: 'primary.main',
                },
                '& .MuiStepLabel-root .Mui-active': {
                  color: 'secondary.main',
                },
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {getStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                color="primary"
                disabled={activeStep === 0 || activeStep === 3}
                onClick={handleBack}
                sx={{ display: activeStep === 0 || activeStep === 3 ? 'none' : 'block' }}
              >
                上一步
              </Button>

              {activeStep < 3 && (
                <Button
                  variant="contained"
                  color={activeStep === 2 ? 'secondary' : 'primary'}
                  onClick={handleNext}
                  startIcon={activeStep === 2 ? <PaymentIcon /> : null}
                  endIcon={activeStep === 1 ? <ShoppingCartIcon /> : null}
                >
                  {activeStep === 2 ? '确认支付' : activeStep === 1 ? '去结算' : '下一步'}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ServiceForm;
