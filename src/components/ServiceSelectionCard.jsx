import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Slider,
  Chip,
  Grid,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// 服务图标映射
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CommentIcon from '@mui/icons-material/Comment';
import TimerIcon from '@mui/icons-material/Timer';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import VisibilityIcon from '@mui/icons-material/Visibility';

const ServiceSelectionCard = ({
  serviceKey,
  serviceLabel,
  value,
  onChange,
  color,
  pricing,
  platform,
  minPurchase = 1,
  maxPurchase = 0
}) => {
  // 服务图标映射
  const serviceIcons = {
    views: <PlayArrowIcon />,
    likes: <ThumbUpIcon />,
    shares: <ShareIcon />,
    saves: <BookmarkIcon />,
    comments: <CommentIcon />,
    completionRate: <TimerIcon />,
    coins: <MonetizationOnIcon />,
    reads: <VisibilityIcon />
  };

  // 服务描述映射
  const serviceDescriptions = {
    views: '增加视频播放量，提高内容曝光度',
    likes: '增加点赞数，提高互动率和推荐概率',
    shares: '增加分享数，扩大内容传播范围',
    saves: '增加收藏量，提高内容质量评分',
    comments: '增加评论数，提高互动率',
    completionRate: '提高完播率，增加算法推荐权重',
    coins: '增加投币数，提高内容质量评分',
    reads: '增加阅读量，提高内容曝光度'
  };

  // 是否激活
  const isActive = value > 0;

  // 最大值设置
  const absoluteMaxValue = serviceKey === 'completionRate' ? 100 : 10000;
  const maxValue = maxPurchase > 0 ? Math.min(maxPurchase, absoluteMaxValue) : absoluteMaxValue;
  const step = serviceKey === 'completionRate' ? 5 : 100;
  const unit = serviceKey === 'completionRate' ? '%' : '个';

  // 应用最小购买量限制
  React.useEffect(() => {
    // 如果当前值小于最小购买量但不为0，则调整为最小购买量
    if (value > 0 && value < minPurchase) {
      onChange(serviceKey, minPurchase);
    }
    // 如果当前值大于最大购买量且最大购买量不为0，则调整为最大购买量
    if (maxPurchase > 0 && value > maxPurchase) {
      onChange(serviceKey, maxPurchase);
    }
  }, [value, minPurchase, maxPurchase, serviceKey, onChange]);

  // 快速选择值
  const quickSelectValues = serviceKey === 'completionRate'
    ? [25, 50, 75, 100].filter(v => maxPurchase === 0 || v <= maxPurchase)
    : [1000, 3000, 5000, 10000].filter(v => maxPurchase === 0 || v <= maxPurchase);

  // 确保最小购买量在快速选择中
  if (minPurchase > 0 && !quickSelectValues.includes(minPurchase)) {
    quickSelectValues.unshift(minPurchase);
  }

  // 确保最大购买量在快速选择中
  if (maxPurchase > 0 && !quickSelectValues.includes(maxPurchase)) {
    quickSelectValues.push(maxPurchase);
  }

  // 排序快速选择值
  quickSelectValues.sort((a, b) => a - b);

  // 处理快速选择
  const handleQuickSelect = (newValue) => {
    onChange(serviceKey, newValue);
  };

  // 处理增加/减少
  const handleIncrement = () => {
    const newValue = Math.min(value + step, maxValue);
    onChange(serviceKey, newValue);
  };

  const handleDecrement = () => {
    // 如果当前值大于最小购买量，则减少到最小购买量，否则减少到0
    if (value > minPurchase) {
      const newValue = Math.max(value - step, minPurchase);
      onChange(serviceKey, newValue);
    } else if (value > 0) {
      // 如果当前值大于0但小于或等于最小购买量，则直接设置为0
      onChange(serviceKey, 0);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <Card
        elevation={isActive ? 8 : 2}
        sx={{
          borderRadius: 3,
          background: `linear-gradient(135deg, rgba(10, 25, 41, 0.95), rgba(2, 8, 16, 0.98))`,
          border: isActive ? `1px solid ${color.main}` : '1px solid rgba(60, 255, 220, 0.1)',
          boxShadow: isActive ? `0 0 20px ${color.light}` : 'none',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          '&::before': isActive ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: `linear-gradient(to right, ${color.main}, transparent)`,
          } : {}
        }}
      >
        {/* 服务标题和图标 */}
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
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
                  color: color.main
                }}
              >
                {serviceIcons[serviceKey] || <InfoOutlinedIcon />}
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'medium',
                    color: isActive ? color.main : 'text.primary',
                    textShadow: isActive ? `0 0 10px ${color.light}` : 'none'
                  }}
                >
                  {serviceLabel}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {serviceDescriptions[serviceKey]}
                </Typography>
              </Box>
            </Box>
            <Tooltip title="服务说明">
              <IconButton size="small" sx={{ color: 'text.secondary' }}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Divider sx={{ my: 2, opacity: 0.2 }} />

          {/* 当前值和价格 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                当前数值
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: isActive ? color.main : 'text.primary',
                  fontWeight: 'bold',
                  textShadow: isActive ? `0 0 10px ${color.light}` : 'none'
                }}
              >
                {value.toLocaleString()}{serviceKey === 'completionRate' ? '%' : ''}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">
                价格
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: isActive ? color.main : 'text.secondary',
                  fontWeight: 'bold',
                  textShadow: isActive ? `0 0 10px ${color.light}` : 'none'
                }}
              >
                ¥{(value * pricing[serviceKey]).toFixed(2)}
              </Typography>
            </Box>
          </Box>

          {/* 增减按钮 */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <IconButton
              onClick={handleDecrement}
              disabled={value <= 0}
              sx={{
                color: value > 0 ? color.main : 'text.disabled',
                '&:hover': { color: color.main }
              }}
            >
              <RemoveCircleOutlineIcon />
            </IconButton>

            <Box sx={{
              px: 2,
              py: 0.5,
              borderRadius: 2,
              mx: 1,
              minWidth: 100,
              textAlign: 'center',
              border: `1px solid ${isActive ? color.main : 'rgba(255,255,255,0.1)'}`,
              background: 'rgba(0,0,0,0.2)'
            }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: isActive ? color.main : 'text.primary' }}>
                {value.toLocaleString()} {unit}
              </Typography>
            </Box>

            <IconButton
              onClick={handleIncrement}
              disabled={value >= maxValue}
              sx={{
                color: value < maxValue ? color.main : 'text.disabled',
                '&:hover': { color: color.main }
              }}
            >
              <AddCircleOutlineIcon />
            </IconButton>
          </Box>

          {/* 滑块 */}
          <Box sx={{ px: 1, mb: 2 }}>
            <Slider
              value={value}
              onChange={(e, newValue) => onChange(serviceKey, newValue)}
              step={step}
              min={0}
              max={maxValue}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => serviceKey === 'completionRate' ? `${value}%` : value.toLocaleString()}
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
                  fontWeight: 'bold',
                  '&::before': {
                    display: 'none'
                  }
                }
              }}
            />
          </Box>

          {/* 快速选择 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            {quickSelectValues.map((quickValue) => (
              <Chip
                key={quickValue}
                label={`${quickValue.toLocaleString()}${serviceKey === 'completionRate' ? '%' : ''}`}
                onClick={() => handleQuickSelect(quickValue)}
                sx={{
                  borderRadius: '16px',
                  backgroundColor: value === quickValue ? color.light : 'rgba(255,255,255,0.05)',
                  color: value === quickValue ? color.main : 'text.secondary',
                  border: `1px solid ${value === quickValue ? color.main : 'transparent'}`,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: color.main
                  },
                  transition: 'all 0.2s ease',
                  fontWeight: value === quickValue ? 'bold' : 'normal',
                  boxShadow: value === quickValue ? `0 0 10px ${color.light}` : 'none',
                }}
              />
            ))}
          </Box>
        </CardContent>

        {/* 底部价格信息 */}
        <Box sx={{
          mt: 'auto',
          p: 2,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}>
          {/* 购买限制信息 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              单价: <Box component="span" sx={{ color: color.main }}>¥{pricing[serviceKey]}</Box>/{serviceKey === 'completionRate' ? '%' : '个'}
            </Typography>

            <Chip
              label={isActive ? "已选择" : "未选择"}
              size="small"
              sx={{
                backgroundColor: isActive ? 'rgba(60, 255, 220, 0.1)' : 'rgba(255,255,255,0.05)',
                color: isActive ? color.main : 'text.secondary',
                border: `1px solid ${isActive ? color.main : 'transparent'}`,
                fontWeight: isActive ? 'bold' : 'normal',
              }}
            />
          </Box>

          {/* 购买限制提示 */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary" align="center">
              {minPurchase > 1 && `最小购买量: ${minPurchase}${unit}`}
              {minPurchase > 1 && maxPurchase > 0 && ' | '}
              {maxPurchase > 0 && `最大购买量: ${maxPurchase}${unit}`}
              {minPurchase <= 1 && maxPurchase <= 0 && '无购买限制'}
            </Typography>
          </Box>
        </Box>
      </Card>
    </motion.div>
  );
};

export default ServiceSelectionCard;
