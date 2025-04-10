import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { userManager } from '../utils/dataManager';
import { Box, CircularProgress, Typography } from '@mui/material';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = userManager.getCurrentUser();
      
      if (!currentUser) {
        setAuthorized(false);
      } else if (adminOnly && !currentUser.isAdmin) {
        setAuthorized(false);
      } else {
        setAuthorized(true);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, [adminOnly]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '50vh' 
      }}>
        <CircularProgress color="primary" />
        <Typography variant="body1" sx={{ mt: 2 }}>
          验证权限中...
        </Typography>
      </Box>
    );
  }

  return authorized ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
