import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Button,
  LinearProgress,
  IconButton,
  Tooltip,
  alpha,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getOrders, deleteOrder, getStatusText, simulateOrderProgress } from '../services/orderService';
import { formatCurrency } from '../utils/formatters';

const OrdersPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // 加载订单数据
  useEffect(() => {
    const loadOrders = () => {
      setLoading(true);
      const orderData = getOrders();
      setOrders(orderData);
      setLoading(false);
    };

    loadOrders();

    // 设置定时器，每5秒刷新一次订单数据
    const intervalId = setInterval(loadOrders, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // 处理搜索
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // 过滤订单
  const filteredOrders = orders.filter(order =>
    (order.orderId || order.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.platform || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    getStatusText(order.status).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 处理删除订单
  const handleDeleteOrder = (orderId) => {
    if (window.confirm('确定要删除此订单吗？')) {
      deleteOrder(orderId);
      setOrders(orders.filter(order => (order.orderId || order.id) !== orderId));
    }
  };

  // 处理查看订单详情
  const handleViewOrder = (orderId) => {
    try {
      if (!orderId) {
        console.error('订单ID不能为空');
        return;
      }

      // 获取订单详情
      const order = getOrderById(orderId);

      if (!order) {
        alert('未找到订单信息');
        return;
      }

      // 在实际应用中，这里会导航到订单详情页
      // 目前使用alert显示订单信息
      const platformName = {
        'douyin': '抖音',
        'xiaohongshu': '小红书',
        'bilibili': '哔哩哔哩',
        'kuaishou': '快手',
        'wechat': '微信'
      }[order.platform] || order.platform;

      const statusText = getStatusText(order.status);
      const totalAmount = order.totalAmount || order.price || 0;

      alert(`订单详情:\n订单编号: ${orderId}\n平台: ${platformName}\n状态: ${statusText}\n进度: ${order.progress || 0}%\n金额: ¥${totalAmount.toFixed(2)}`);
    } catch (error) {
      console.error('查看订单详情失败:', error);
      alert('查看订单详情失败');
    }
  };

  // 处理创建新订单
  const handleCreateOrder = () => {
    navigate('/service');
  };

  // 处理模拟订单进度
  const handleSimulateProgress = (orderId) => {
    simulateOrderProgress(orderId, (updatedOrder) => {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.orderId === updatedOrder.orderId ? updatedOrder : order
        )
      );
    });
  };

  // 获取状态颜色
  const getStatusColor = (status) => {
    const statusColors = {
      'waiting': theme.palette.warning.main,
      'processing': theme.palette.info.main,
      'completed': theme.palette.success.main,
      'cancelled': theme.palette.error.main,
      'pending': theme.palette.warning.main,
      'in_progress': theme.palette.info.main
    };

    return statusColors[status] || theme.palette.text.primary;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          borderBottom: '1px solid',
          borderColor: 'rgba(60, 255, 220, 0.3)',
          pb: 2
        }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontFamily: 'Orbitron',
              color: theme.palette.primary.main,
              textShadow: '0 0 10px rgba(60, 255, 220, 0.5)'
            }}
          >
            订单记录
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="搜索订单..."
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(60, 255, 220, 0.7)' }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  bgcolor: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(60, 255, 220, 0.3)',
                  '&:hover': {
                    border: '1px solid rgba(60, 255, 220, 0.5)',
                  },
                  '& .MuiInputBase-input': {
                    color: theme.palette.text.primary,
                  }
                }
              }}
            />

            <Tooltip title="筛选">
              <IconButton
                sx={{
                  color: theme.palette.primary.main,
                  border: '1px solid rgba(60, 255, 220, 0.3)',
                  '&:hover': {
                    bgcolor: 'rgba(60, 255, 220, 0.1)',
                  }
                }}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Paper
          elevation={0}
          sx={{
            overflow: 'hidden',
            bgcolor: 'rgba(3, 11, 23, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(60, 255, 220, 0.2)',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontFamily: 'Orbitron',
                      color: theme.palette.primary.main,
                      borderBottom: '1px solid rgba(60, 255, 220, 0.2)'
                    }}
                  >
                    订单编号
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: 'Orbitron',
                      color: theme.palette.primary.main,
                      borderBottom: '1px solid rgba(60, 255, 220, 0.2)'
                    }}
                  >
                    平台
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: 'Orbitron',
                      color: theme.palette.primary.main,
                      borderBottom: '1px solid rgba(60, 255, 220, 0.2)'
                    }}
                  >
                    服务
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: 'Orbitron',
                      color: theme.palette.primary.main,
                      borderBottom: '1px solid rgba(60, 255, 220, 0.2)'
                    }}
                  >
                    状态
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: 'Orbitron',
                      color: theme.palette.primary.main,
                      borderBottom: '1px solid rgba(60, 255, 220, 0.2)'
                    }}
                  >
                    进度
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: 'Orbitron',
                      color: theme.palette.primary.main,
                      borderBottom: '1px solid rgba(60, 255, 220, 0.2)'
                    }}
                  >
                    金额
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: 'Orbitron',
                      color: theme.palette.primary.main,
                      borderBottom: '1px solid rgba(60, 255, 220, 0.2)'
                    }}
                  >
                    操作
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <LinearProgress
                        sx={{
                          my: 2,
                          bgcolor: 'rgba(60, 255, 220, 0.1)',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: theme.palette.primary.main
                          }
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        暂无订单记录
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    // 获取服务描述
                    const serviceDescription = Object.entries(order.services)
                      .filter(([_, value]) => value > 0)
                      .map(([key, value]) => {
                        const serviceNames = {
                          likes: '点赞数',
                          views: '播放量',
                          comments: '评论数',
                          shares: '分享数',
                          followers: '粉丝数',
                          completionRate: '完播率'
                        };
                        return `${serviceNames[key]}: ${value}`;
                      })
                      .join(', ');

                    return (
                      <TableRow
                        key={order.orderId || order.id}
                        sx={{
                          '&:hover': {
                            bgcolor: 'rgba(60, 255, 220, 0.05)'
                          },
                          borderBottom: '1px solid rgba(60, 255, 220, 0.1)'
                        }}
                      >
                        <TableCell
                          sx={{
                            fontFamily: 'Rajdhani',
                            fontWeight: 'bold',
                            color: theme.palette.text.primary
                          }}
                        >
                          {order.orderId || order.id}
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              border: '1px solid',
                              borderColor: alpha(theme.palette.primary.main, 0.3),
                              color: theme.palette.primary.main,
                              fontWeight: 'medium',
                              fontSize: '0.875rem'
                            }}
                          >
                            {order.platform}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 200, whiteSpace: 'normal' }}>
                            {serviceDescription}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              bgcolor: alpha(getStatusColor(order.status), 0.1),
                              border: '1px solid',
                              borderColor: alpha(getStatusColor(order.status), 0.3),
                              color: getStatusColor(order.status),
                              fontWeight: 'medium',
                              fontSize: '0.875rem'
                            }}
                          >
                            {getStatusText(order.status)}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={order.progress}
                              sx={{
                                width: 100,
                                height: 8,
                                borderRadius: 1,
                                bgcolor: 'rgba(60, 255, 220, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: getStatusColor(order.status)
                                }
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {order.progress}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 'bold',
                            color: theme.palette.primary.main
                          }}
                        >
                          {formatCurrency(order.totalAmount || order.price)}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="查看详情">
                              <IconButton
                                size="small"
                                onClick={() => handleViewOrder(order.orderId || order.id)}
                                sx={{
                                  color: theme.palette.info.main,
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.info.main, 0.1)
                                  }
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {order.status === 'waiting' && (
                              <Tooltip title="模拟进度">
                                <IconButton
                                  size="small"
                                  onClick={() => handleSimulateProgress(order.orderId || order.id)}
                                  sx={{
                                    color: theme.palette.success.main,
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.success.main, 0.1)
                                    }
                                  }}
                                >
                                  <AddIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}

                            <Tooltip title="删除订单">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteOrder(order.orderId || order.id)}
                                sx={{
                                  color: theme.palette.error.main,
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.error.main, 0.1)
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateOrder}
              sx={{
                fontFamily: 'Orbitron',
                px: 4,
                py: 1.5,
                borderRadius: 2,
                boxShadow: '0 0 15px rgba(60, 255, 220, 0.5)',
                '&:hover': {
                  boxShadow: '0 0 20px rgba(60, 255, 220, 0.7)',
                }
              }}
            >
              创建新订单
            </Button>
          </motion.div>
        </Box>
      </motion.div>
    </Container>
  );
};

export default OrdersPage;
