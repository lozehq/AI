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
  useTheme,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Snackbar,
  Alert,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  PlayArrow as PlayArrowIcon,
  AdminPanelSettings as AdminPanelSettingsIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getOrders, deleteOrder, getStatusText, simulateOrderProgress, updateOrderStatus, getOrderById } from '../services/orderService';
import { formatCurrency } from '../utils/formatters';
import { userManager } from '../utils/dataManager';

const OrdersPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // 进度模拟对话框
  const [progressDialog, setProgressDialog] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [progressValue, setProgressValue] = useState(0);

  // 提示消息
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // 检查用户权限
  useEffect(() => {
    const user = userManager.getCurrentUser();
    setCurrentUser(user);
    setIsAdmin(user?.isAdmin || false);

    // 打印调试信息
    console.log('当前用户：', user);
    console.log('管理员状态：', user?.isAdmin || false);
  }, []);

  // 加载订单数据
  useEffect(() => {
    const loadOrders = () => {
      setLoading(true);
      const allOrders = getOrders();

      // 如果是管理员，显示所有订单，否则只显示当前用户的订单
      if (currentUser) {
        if (currentUser.isAdmin) {
          setOrders(allOrders);
        } else {
          // 过滤出当前用户的订单
          const userOrders = allOrders.filter(order => order.userId === currentUser.id);
          setOrders(userOrders);
        }
      } else {
        setOrders([]);
      }

      setLoading(false);
    };

    loadOrders();

    // 设置定时器，每5秒刷新一次订单数据
    const intervalId = setInterval(loadOrders, 5000);

    return () => clearInterval(intervalId);
  }, [currentUser, isAdmin]);

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

  // 订单详情对话框状态
  const [orderDetailDialog, setOrderDetailDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
        showSnackbar('未找到订单信息', 'error');
        return;
      }

      // 设置选中的订单并打开详情对话框
      setSelectedOrder(order);
      setOrderDetailDialog(true);
    } catch (error) {
      console.error('查看订单详情失败:', error);
      showSnackbar('查看订单详情失败', 'error');
    }
  };

  // 处理关闭订单详情对话框
  const handleCloseOrderDetail = () => {
    setOrderDetailDialog(false);
    setSelectedOrder(null);
  };

  // 处理订单状态更新
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    if (!isAdmin) {
      showSnackbar('只有管理员可以更新订单状态', 'warning');
      return;
    }

    try {
      // 根据状态设置进度
      let progress = 0;
      if (newStatus === 'completed') {
        progress = 100;
      } else if (newStatus === 'processing' || newStatus === 'in_progress') {
        progress = 50;
      }

      // 更新订单状态
      updateOrderStatus(orderId, newStatus, progress);

      // 更新本地状态
      setOrders(prevOrders =>
        prevOrders.map(order =>
          (order.orderId === orderId || order.id === orderId)
            ? { ...order, status: newStatus, progress }
            : order
        )
      );

      // 如果当前正在查看该订单，更新选中的订单
      if (selectedOrder && (selectedOrder.orderId === orderId || selectedOrder.id === orderId)) {
        setSelectedOrder({ ...selectedOrder, status: newStatus, progress });
      }

      showSnackbar(`订单状态已更新为 ${getStatusText(newStatus)}`, 'success');
    } catch (error) {
      console.error('更新订单状态失败:', error);
      showSnackbar('更新订单状态失败', 'error');
    }
  };

  // 处理创建新订单
  const handleCreateOrder = () => {
    navigate('/service');
  };

  // 显示提示消息
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // 关闭提示消息
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // 打开进度模拟对话框
  const handleOpenProgressDialog = (order) => {
    if (!isAdmin) {
      showSnackbar('只有管理员可以模拟订单进度', 'warning');
      return;
    }

    setCurrentOrder(order);
    setProgressValue(order.progress || 0);
    setProgressDialog(true);
  };

  // 处理进度改变
  const handleProgressChange = (event, newValue) => {
    setProgressValue(newValue);
  };

  // 保存进度更新
  const handleSaveProgress = () => {
    if (!currentOrder) return;

    const orderId = currentOrder.orderId || currentOrder.id;
    let status = currentOrder.status;

    // 根据进度自动更新状态
    if (progressValue === 0) {
      status = 'waiting';
    } else if (progressValue === 100) {
      status = 'completed';
    } else {
      status = 'processing';
    }

    // 更新订单状态和进度
    updateOrderStatus(orderId, status, progressValue);

    // 更新本地状态
    setOrders(prevOrders =>
      prevOrders.map(order =>
        (order.orderId === orderId || order.id === orderId)
          ? { ...order, status, progress: progressValue }
          : order
      )
    );

    showSnackbar(`订单 ${orderId} 进度已更新为 ${progressValue}%`, 'success');
    setProgressDialog(false);
  };

  // 处理模拟订单进度
  const handleSimulateProgress = (orderId) => {
    if (!isAdmin) {
      showSnackbar('只有管理员可以模拟订单进度', 'warning');
      return;
    }

    simulateOrderProgress(orderId, (updatedOrder) => {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          (order.orderId === updatedOrder.orderId || order.id === updatedOrder.id)
            ? updatedOrder
            : order
        )
      );
    });

    showSnackbar(`订单 ${orderId} 开始自动模拟进度`, 'info');
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

                            {/* 进度调整按钮 - 所有订单都显示，但只有管理员可用 */}
                            <Tooltip title="调整进度">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenProgressDialog(order)}
                                sx={{
                                  color: isAdmin ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.5),
                                  '&:hover': {
                                    bgcolor: isAdmin ? alpha(theme.palette.primary.main, 0.1) : 'transparent'
                                  }
                                }}
                                disabled={!isAdmin}
                              >
                                <AdminPanelSettingsIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            {/* 自动模拟进度按钮 - 只有等待中的订单显示 */}
                            {order.status === 'waiting' && (
                              <Tooltip title="自动模拟进度">
                                <IconButton
                                  size="small"
                                  onClick={() => handleSimulateProgress(order.orderId || order.id)}
                                  sx={{
                                    color: isAdmin ? theme.palette.success.main : alpha(theme.palette.success.main, 0.5),
                                    '&:hover': {
                                      bgcolor: isAdmin ? alpha(theme.palette.success.main, 0.1) : 'transparent'
                                    }
                                  }}
                                  disabled={!isAdmin}
                                >
                                  <PlayArrowIcon fontSize="small" />
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

      {/* 进度模拟对话框 */}
      <Dialog open={progressDialog} onClose={() => setProgressDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Orbitron' }}>
          调整订单进度
        </DialogTitle>
        <DialogContent>
          {currentOrder && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                订单编号: {currentOrder.orderId || currentOrder.id}
              </Typography>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, mb: 1 }}>
                当前状态:
                <Chip
                  label={getStatusText(currentOrder.status)}
                  size="small"
                  sx={{
                    ml: 1,
                    bgcolor: alpha(getStatusColor(currentOrder.status), 0.1),
                    color: getStatusColor(currentOrder.status),
                    borderColor: getStatusColor(currentOrder.status),
                    border: '1px solid'
                  }}
                />
              </Typography>

              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography id="progress-slider" gutterBottom>
                  进度: {progressValue}%
                </Typography>
                <Slider
                  value={progressValue}
                  onChange={handleProgressChange}
                  aria-labelledby="progress-slider"
                  valueLabelDisplay="auto"
                  step={5}
                  marks
                  min={0}
                  max={100}
                  sx={{
                    color: theme.palette.primary.main,
                    '& .MuiSlider-thumb': {
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: `0px 0px 0px 8px ${alpha(theme.palette.primary.main, 0.16)}`
                      },
                    },
                  }}
                />
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                请拖动滑块调整订单进度。进度为0%时状态为“待处理”，进度为100%时状态为“已完成”，其他进度状态为“进行中”。
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProgressDialog(false)}>取消</Button>
          <Button onClick={handleSaveProgress} color="primary">保存</Button>
        </DialogActions>
      </Dialog>

      {/* 订单详情对话框 */}
      <Dialog open={orderDetailDialog} onClose={handleCloseOrderDetail} maxWidth="md" fullWidth>
        {selectedOrder && (
          <>
            <DialogTitle sx={{ fontFamily: 'Orbitron', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                订单详情
              </Typography>
              <Chip
                label={getStatusText(selectedOrder.status)}
                size="small"
                sx={{
                  bgcolor: alpha(getStatusColor(selectedOrder.status), 0.1),
                  color: getStatusColor(selectedOrder.status),
                  borderColor: getStatusColor(selectedOrder.status),
                  border: '1px solid'
                }}
              />
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                {/* 订单基本信息 */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'rgba(10, 25, 41, 0.7)', border: '1px solid rgba(60, 255, 220, 0.2)' }}>
                  <Typography variant="h6" color="primary.main" gutterBottom>
                    基本信息
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        订单编号
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'Rajdhani', fontWeight: 'bold' }}>
                        {selectedOrder.orderId || selectedOrder.id}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        创建时间
                      </Typography>
                      <Typography variant="body1">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        平台
                      </Typography>
                      <Typography variant="body1">
                        {{
                          'douyin': '抖音',
                          'xiaohongshu': '小红书',
                          'bilibili': '哔哩哔哩',
                          'kuaishou': '快手',
                          'wechat': '微信'
                        }[selectedOrder.platform] || selectedOrder.platform}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        金额
                      </Typography>
                      <Typography variant="body1" color="primary.main" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(selectedOrder.totalAmount || selectedOrder.price || 0)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                {/* 订单进度 */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'rgba(10, 25, 41, 0.7)', border: '1px solid rgba(60, 255, 220, 0.2)' }}>
                  <Typography variant="h6" color="primary.main" gutterBottom>
                    订单进度
                  </Typography>
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {selectedOrder.progress || 0}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getStatusText(selectedOrder.status)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={selectedOrder.progress || 0}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: 'rgba(60, 255, 220, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getStatusColor(selectedOrder.status)
                        }
                      }}
                    />
                  </Box>

                  {isAdmin && (
                    <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        onClick={() => handleUpdateOrderStatus(selectedOrder.orderId || selectedOrder.id, 'waiting')}
                        disabled={selectedOrder.status === 'waiting'}
                      >
                        标记为待处理
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="info"
                        onClick={() => handleUpdateOrderStatus(selectedOrder.orderId || selectedOrder.id, 'processing')}
                        disabled={selectedOrder.status === 'processing'}
                      >
                        标记为进行中
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => handleUpdateOrderStatus(selectedOrder.orderId || selectedOrder.id, 'completed')}
                        disabled={selectedOrder.status === 'completed'}
                      >
                        标记为已完成
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleUpdateOrderStatus(selectedOrder.orderId || selectedOrder.id, 'cancelled')}
                        disabled={selectedOrder.status === 'cancelled'}
                      >
                        标记为已取消
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          handleCloseOrderDetail();
                          setCurrentOrder(selectedOrder);
                          setProgressValue(selectedOrder.progress || 0);
                          setProgressDialog(true);
                        }}
                        sx={{ ml: 'auto' }}
                      >
                        调整进度
                      </Button>
                    </Box>
                  )}
                </Paper>

                {/* 服务详情 */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'rgba(10, 25, 41, 0.7)', border: '1px solid rgba(60, 255, 220, 0.2)' }}>
                  <Typography variant="h6" color="primary.main" gutterBottom>
                    服务详情
                  </Typography>
                  <TableContainer component={Box}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>服务类型</TableCell>
                          <TableCell align="right">数量</TableCell>
                          <TableCell align="right">单价</TableCell>
                          <TableCell align="right">小计</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedOrder.services && Object.entries(selectedOrder.services)
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
                            const price = 0.1; // 假设每个服务的单价都是0.1元
                            return (
                              <TableRow key={key}>
                                <TableCell>{serviceNames[key] || key}</TableCell>
                                <TableCell align="right">{value}</TableCell>
                                <TableCell align="right">¥0.10</TableCell>
                                <TableCell align="right">{formatCurrency(value * price)}</TableCell>
                              </TableRow>
                            );
                          })}
                        <TableRow>
                          <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>总计</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            {formatCurrency(selectedOrder.totalAmount || selectedOrder.price || 0)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>

                {/* 备注信息 */}
                {selectedOrder.notes && (
                  <Paper sx={{ p: 2, bgcolor: 'rgba(10, 25, 41, 0.7)', border: '1px solid rgba(60, 255, 220, 0.2)' }}>
                    <Typography variant="h6" color="primary.main" gutterBottom>
                      备注信息
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedOrder.notes}
                    </Typography>
                  </Paper>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              {isAdmin && (
                <Button
                  color="error"
                  onClick={() => {
                    handleCloseOrderDetail();
                    handleDeleteOrder(selectedOrder.orderId || selectedOrder.id);
                  }}
                  sx={{ mr: 'auto' }}
                >
                  删除订单
                </Button>
              )}
              <Button onClick={handleCloseOrderDetail}>关闭</Button>
              {isAdmin && selectedOrder.status === 'waiting' && (
                <Button
                  color="primary"
                  variant="contained"
                  onClick={() => {
                    handleCloseOrderDetail();
                    handleSimulateProgress(selectedOrder.orderId || selectedOrder.id);
                  }}
                >
                  开始处理
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* 提示消息 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OrdersPage;
