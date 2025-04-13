import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Badge,
  Popover,
  Button,
  Tooltip,
  Fade,
  Chip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  MarkEmailRead as MarkEmailReadIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { notificationManager } from '../utils/notificationManager';
import { userManager } from '../utils/dataManager';

const NotificationCenter = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const user = userManager.getCurrentUser();

  // 加载通知
  const loadNotifications = () => {
    if (!user) return;

    const userNotifications = notificationManager.getUserNotifications(user.id);
    const userReadStatus = notificationManager.getUserReadStatus(user.id);

    // 过滤出未读通知
    const unreadNotifications = userNotifications.filter(notification => {
      return !userReadStatus.includes(notification.id);
    });

    setNotifications(userNotifications);
    setUnreadCount(unreadNotifications.length);
    console.log('用户通知中心加载的通知:', userNotifications);
  };

  // 初始加载
  useEffect(() => {
    loadNotifications();

    // 每分钟刷新一次通知
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // 打开通知面板
  const handleOpenNotifications = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // 关闭通知面板
  const handleCloseNotifications = () => {
    setAnchorEl(null);
  };

  // 查看通知详情
  const handleViewNotification = (notification) => {
    setSelectedNotification(notification);

    // 标记为已读
    if (user) {
      notificationManager.markAsRead(user.id, notification.id);
      loadNotifications(); // 重新加载通知以更新未读数
    }
  };

  // 关闭通知详情
  const handleCloseNotificationDetail = () => {
    setSelectedNotification(null);
  };

  // 标记所有通知为已读
  const handleMarkAllAsRead = () => {
    if (user) {
      notificationManager.markAllAsRead(user.id);
      loadNotifications();
    }
  };

  // 获取通知图标
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'warning':
        return <WarningIcon sx={{ color: 'warning.main' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      default: // info
        return <InfoIcon sx={{ color: 'info.main' }} />;
    }
  };

  // 获取通知颜色
  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'success.main';
      case 'warning':
        return 'warning.main';
      case 'error':
        return 'error.main';
      default: // info
        return 'info.main';
    }
  };

  // 检查通知是否已读
  const isNotificationRead = (notificationId) => {
    if (!user) return true;

    const userReadStatus = notificationManager.getUserReadStatus(user.id);
    return userReadStatus.includes(notificationId);
  };

  // 通知面板是否打开
  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="通知中心" arrow>
        <IconButton
          color="inherit"
          onClick={handleOpenNotifications}
          sx={{
            position: 'relative',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.1)',
            }
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            overlap="circular"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.7rem',
                height: '20px',
                minWidth: '20px',
                borderRadius: '10px',
                boxShadow: '0 0 10px rgba(255, 77, 106, 0.5)'
              }
            }}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseNotifications}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 500,
            borderRadius: 2,
            bgcolor: 'rgba(3, 11, 23, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(60, 255, 220, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(60, 255, 220, 0.2)' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            通知
          </Typography>

          {unreadCount > 0 && (
            <Tooltip title="标记所有为已读" arrow>
              <IconButton size="small" onClick={handleMarkAllAsRead}>
                <MarkEmailReadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              暂无通知
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => {
              const isRead = isNotificationRead(notification.id);

              return (
                <React.Fragment key={notification.id}>
                  {index > 0 && <Divider sx={{ opacity: 0.1 }} />}
                  <ListItem
                    button
                    onClick={() => handleViewNotification(notification)}
                    sx={{
                      py: 1.5,
                      bgcolor: isRead ? 'transparent' : 'rgba(60, 255, 220, 0.05)',
                      '&:hover': {
                        bgcolor: 'rgba(60, 255, 220, 0.1)',
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isRead ? 'normal' : 'bold',
                            color: isRead ? 'text.primary' : 'primary.main',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {notification.content}
                        </Typography>
                      }
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: '0.7rem', ml: 1, whiteSpace: 'nowrap' }}
                    >
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </Typography>
                  </ListItem>
                </React.Fragment>
              );
            })}
          </List>
        )}

        <Box sx={{ p: 2, borderTop: '1px solid rgba(60, 255, 220, 0.2)', textAlign: 'center' }}>
          <Button
            variant="text"
            size="small"
            onClick={handleCloseNotifications}
            sx={{ color: 'primary.main' }}
          >
            查看全部通知
          </Button>
        </Box>
      </Popover>

      {/* 通知详情对话框 */}
      <Popover
        open={Boolean(selectedNotification)}
        anchorEl={anchorEl}
        onClose={handleCloseNotificationDetail}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            width: 400,
            borderRadius: 2,
            bgcolor: 'rgba(3, 11, 23, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(60, 255, 220, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
            p: 3
          }
        }}
      >
        {selectedNotification && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              {getNotificationIcon(selectedNotification.type)}
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: getNotificationColor(selectedNotification.type) }}>
                {selectedNotification.title}
              </Typography>
            </Box>

            <Divider sx={{ mb: 2, opacity: 0.2 }} />

            <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
              {selectedNotification.content}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Chip
                label={selectedNotification.type}
                size="small"
                sx={{
                  bgcolor: `${getNotificationColor(selectedNotification.type)}20`,
                  color: getNotificationColor(selectedNotification.type),
                  borderRadius: '4px',
                  textTransform: 'capitalize'
                }}
              />

              <Typography variant="caption" color="text.secondary">
                {new Date(selectedNotification.createdAt).toLocaleString()}
              </Typography>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'right' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCloseNotificationDetail}
              >
                关闭
              </Button>
            </Box>
          </motion.div>
        )}
      </Popover>
    </>
  );
};

export default NotificationCenter;
