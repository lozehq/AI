import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Chip
} from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { notificationManager } from '../utils/notificationManager';
import { userManager } from '../utils/dataManager';

const NotificationWidget = () => {
  const [notifications, setNotifications] = useState([]);
  const user = userManager.getCurrentUser();

  // 加载通知
  useEffect(() => {
    if (!user) return;

    const loadNotifications = () => {
      // 获取用户可见的最新的5条通知
      const userNotifications = notificationManager.getUserNotifications(user.id);
      const recentNotifications = userNotifications.slice(0, 5);
      setNotifications(recentNotifications);
      console.log('用户通知小部件加载的通知:', recentNotifications);
    };

    loadNotifications();

    // 每分钟刷新一次通知
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // 检查通知是否已读
  const isNotificationRead = (notificationId) => {
    if (!user) return true;

    const userReadStatus = notificationManager.getUserReadStatus(user.id);
    return userReadStatus.includes(notificationId);
  };

  // 标记通知为已读
  const handleMarkAsRead = (notificationId) => {
    if (user) {
      notificationManager.markAsRead(user.id, notificationId);
      // 强制重新渲染
      setNotifications([...notifications]);
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        elevation={3}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: 'rgba(3, 11, 23, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(60, 255, 220, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          mb: 3
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(60, 255, 220, 0.2)' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            通知
          </Typography>
        </Box>

        <List sx={{ p: 0 }}>
          {notifications.map((notification, index) => {
            const isRead = isNotificationRead(notification.id);

            return (
              <React.Fragment key={notification.id}>
                {index > 0 && <Divider sx={{ opacity: 0.1 }} />}
                <ListItem
                  component={Link}
                  to="/notifications"
                  onClick={() => handleMarkAsRead(notification.id)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    bgcolor: isRead ? 'transparent' : 'rgba(60, 255, 220, 0.05)',
                    '&:hover': {
                      bgcolor: 'rgba(60, 255, 220, 0.1)',
                      textDecoration: 'none'
                    },
                    transition: 'all 0.2s ease',
                    color: 'inherit',
                    textDecoration: 'none'
                  }}
                >
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
                </ListItem>
              </React.Fragment>
            );
          })}
        </List>

        <Box sx={{ p: 2, borderTop: '1px solid rgba(60, 255, 220, 0.2)', textAlign: 'center' }}>
          <Button
            component={Link}
            to="/notifications"
            variant="text"
            size="small"
            sx={{ color: 'primary.main' }}
          >
            查看全部通知
          </Button>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default NotificationWidget;
