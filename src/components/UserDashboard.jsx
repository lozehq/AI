import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Tabs, 
  Tab, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  LinearProgress,
  Divider,
  IconButton,
  TextField,
  InputAdornment
} from '@mui/material';
import { motion } from 'framer-motion';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Mock data for orders
const mockOrders = [
  {
    id: 'ORD-123456',
    platform: 'douyin',
    platformName: '抖音',
    date: '2025-04-09',
    status: 'completed',
    services: {
      views: 1000,
      likes: 200
    },
    progress: 100,
    price: 140.00,
    url: 'https://v.douyin.com/example1'
  },
  {
    id: 'ORD-123457',
    platform: 'xiaohongshu',
    platformName: '小红书',
    date: '2025-04-08',
    status: 'in_progress',
    services: {
      views: 2000,
      likes: 300,
      saves: 100
    },
    progress: 65,
    price: 290.00,
    url: 'https://www.xiaohongshu.com/example2'
  },
  {
    id: 'ORD-123458',
    platform: 'bilibili',
    platformName: '哔哩哔哩',
    date: '2025-04-07',
    status: 'pending',
    services: {
      views: 5000,
      likes: 500,
      shares: 200
    },
    progress: 0,
    price: 670.00,
    url: 'https://www.bilibili.com/example3'
  }
];

// Service name mapping
const serviceNames = {
  views: '播放量',
  likes: '点赞数',
  shares: '分享数',
  saves: '收藏量',
  completionRate: '完播率'
};

// Status mapping
const statusColors = {
  completed: 'success',
  in_progress: 'info',
  pending: 'warning',
  failed: 'error'
};

const statusLabels = {
  completed: '已完成',
  in_progress: '进行中',
  pending: '待处理',
  failed: '失败'
};

const UserDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [orders] = useState(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock user data
  const user = {
    name: '用户123456',
    balance: 500.00,
    joinDate: '2025-03-15',
    totalOrders: mockOrders.length
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.platformName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ py: 6, minHeight: '80vh' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Sidebar */}
          <Grid item xs={12} md={3}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card 
                className="glass-panel"
                sx={{ mb: 3 }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      mx: 'auto', 
                      mb: 2,
                      bgcolor: 'primary.main',
                      boxShadow: '0 0 15px rgba(0, 240, 255, 0.5)'
                    }}
                  >
                    <AccountCircleIcon sx={{ fontSize: 50 }} />
                  </Avatar>
                  
                  <Typography variant="h6" gutterBottom>
                    {user.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    注册时间: {user.joinDate}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      账户余额:
                    </Typography>
                    <Typography variant="h6" color="primary.main" sx={{ mb: 2 }}>
                      ¥{user.balance.toFixed(2)}
                    </Typography>
                    
                    <Button 
                      variant="contained" 
                      color="primary"
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      充值
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      color="secondary"
                      fullWidth
                    >
                      提现
                    </Button>
                  </Box>
                </CardContent>
              </Card>
              
              <Card className="glass-panel">
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  orientation="vertical"
                  variant="fullWidth"
                  sx={{
                    '& .MuiTab-root': {
                      alignItems: 'flex-start',
                      textAlign: 'left',
                      py: 2
                    }
                  }}
                >
                  <Tab 
                    icon={<HistoryIcon />} 
                    iconPosition="start" 
                    label="订单记录" 
                  />
                  <Tab 
                    icon={<AccountBalanceWalletIcon />} 
                    iconPosition="start" 
                    label="账户余额" 
                  />
                  <Tab 
                    icon={<SettingsIcon />} 
                    iconPosition="start" 
                    label="账户设置" 
                  />
                </Tabs>
              </Card>
            </motion.div>
          </Grid>
          
          {/* Main content */}
          <Grid item xs={12} md={9}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {tabValue === 0 && (
                <>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3
                  }}>
                    <Typography variant="h5" component="h1">
                      订单记录
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        placeholder="搜索订单..."
                        size="small"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ width: 200 }}
                      />
                      
                      <IconButton color="primary">
                        <FilterListIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <TableContainer 
                    component={Paper}
                    sx={{ 
                      background: 'rgba(10, 18, 41, 0.7)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      border: '1px solid rgba(0, 240, 255, 0.2)',
                      boxShadow: '0 0 20px rgba(0, 240, 255, 0.1)',
                      mb: 4
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>订单编号</TableCell>
                          <TableCell>平台</TableCell>
                          <TableCell>服务</TableCell>
                          <TableCell>状态</TableCell>
                          <TableCell>进度</TableCell>
                          <TableCell>金额</TableCell>
                          <TableCell>操作</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredOrders.length > 0 ? (
                          filteredOrders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell>{order.id}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={order.platformName} 
                                  size="small"
                                  sx={{ 
                                    bgcolor: 'rgba(0, 240, 255, 0.1)',
                                    border: '1px solid rgba(0, 240, 255, 0.3)',
                                    color: 'white'
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ maxWidth: 200 }}>
                                  {Object.entries(order.services).map(([key, value]) => (
                                    <Typography variant="body2" key={key} sx={{ fontSize: '0.8rem' }}>
                                      {serviceNames[key]}: {key === 'completionRate' ? `${value}%` : value}
                                    </Typography>
                                  ))}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={statusLabels[order.status]} 
                                  color={statusColors[order.status]}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: 100 }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={order.progress} 
                                    sx={{ 
                                      flexGrow: 1,
                                      height: 8,
                                      borderRadius: 4
                                    }}
                                  />
                                  <Typography variant="body2" sx={{ minWidth: 35 }}>
                                    {order.progress}%
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>¥{order.price.toFixed(2)}</TableCell>
                              <TableCell>
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  title="查看详情"
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} align="center">
                              没有找到匹配的订单
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      href="/"
                    >
                      创建新订单
                    </Button>
                  </Box>
                </>
              )}
              
              {tabValue === 1 && (
                <Box>
                  <Typography variant="h5" component="h1" gutterBottom>
                    账户余额
                  </Typography>
                  
                  <Card 
                    className="glass-panel"
                    sx={{ mb: 4, p: 3 }}
                  >
                    <Typography variant="h4" color="primary.main" gutterBottom>
                      ¥{user.balance.toFixed(2)}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      可用余额
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Button 
                          variant="contained" 
                          color="primary"
                          fullWidth
                        >
                          充值
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button 
                          variant="outlined" 
                          color="secondary"
                          fullWidth
                        >
                          提现
                        </Button>
                      </Grid>
                    </Grid>
                  </Card>
                  
                  <Typography variant="h6" gutterBottom>
                    交易记录
                  </Typography>
                  
                  <Card className="glass-panel">
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        暂无交易记录
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              )}
              
              {tabValue === 2 && (
                <Box>
                  <Typography variant="h5" component="h1" gutterBottom>
                    账户设置
                  </Typography>
                  
                  <Card 
                    className="glass-panel"
                    sx={{ mb: 4 }}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        个人信息
                      </Typography>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="用户名"
                            defaultValue={user.name}
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="电子邮箱"
                            defaultValue="user@example.com"
                            margin="normal"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="手机号码"
                            defaultValue="138****1234"
                            margin="normal"
                          />
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ mt: 3, textAlign: 'right' }}>
                        <Button 
                          variant="contained" 
                          color="primary"
                        >
                          保存修改
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                  
                  <Card className="glass-panel">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        安全设置
                      </Typography>
                      
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body1" gutterBottom>
                          修改密码
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="当前密码"
                              type="password"
                              margin="normal"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="新密码"
                              type="password"
                              margin="normal"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="确认新密码"
                              type="password"
                              margin="normal"
                            />
                          </Grid>
                        </Grid>
                        
                        <Box sx={{ mt: 3, textAlign: 'right' }}>
                          <Button 
                            variant="contained" 
                            color="primary"
                          >
                            更新密码
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default UserDashboard;
