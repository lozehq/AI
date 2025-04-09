/**
 * Order processing utility
 * This simulates the backend processing of orders
 */

import { orderManager, userManager } from './dataManager';

/**
 * Process a new order
 * @param {Object} orderData - Order data including services, platform, url, etc.
 * @param {string} userId - User ID
 * @returns {Object} - Created order object
 */
export const processNewOrder = (orderData, userId) => {
  // Calculate total price
  let totalPrice = 0;
  for (const [service, amount] of Object.entries(orderData.services)) {
    // These prices would normally come from a database
    const pricePerUnit = {
      views: 0.1,
      likes: 0.2,
      completionRate: 0.3,
      shares: 0.2,
      saves: 0.2,
      comments: 0.3,
      coins: 0.3,
      reads: 0.1
    };
    
    totalPrice += amount * pricePerUnit[service];
  }
  
  // Check if user has enough balance
  const user = userManager.getUserById(userId);
  if (!user || user.balance < totalPrice) {
    throw new Error('Insufficient balance');
  }
  
  // Deduct balance from user
  userManager.updateBalance(userId, -totalPrice);
  
  // Create order
  const order = orderManager.createOrder({
    userId,
    platform: orderData.platform,
    platformName: orderData.platformName,
    url: orderData.url,
    services: orderData.services,
    price: totalPrice,
    date: new Date().toISOString().split('T')[0]
  });
  
  // Simulate starting the order processing
  simulateOrderProcessing(order.id);
  
  return order;
};

/**
 * Simulate order processing with progress updates
 * @param {string} orderId - Order ID to process
 */
const simulateOrderProcessing = (orderId) => {
  // Update order to in_progress
  orderManager.updateOrderStatus(orderId, 'in_progress', 0);
  
  // Simulate progress updates
  const progressIntervals = [25, 50, 75, 100];
  let intervalIndex = 0;
  
  const progressInterval = setInterval(() => {
    if (intervalIndex >= progressIntervals.length) {
      clearInterval(progressInterval);
      // Mark as completed when reaching 100%
      orderManager.updateOrderStatus(orderId, 'completed', 100);
      return;
    }
    
    // Update progress
    const progress = progressIntervals[intervalIndex];
    orderManager.updateOrderStatus(orderId, 'in_progress', progress);
    intervalIndex++;
  }, 5000); // Update every 5 seconds for demo purposes
};

/**
 * Get order status with details
 * @param {string} orderId - Order ID
 * @returns {Object} - Order status object
 */
export const getOrderStatus = (orderId) => {
  return orderManager.getOrderById(orderId);
};

/**
 * Get all orders for a user
 * @param {string} userId - User ID
 * @returns {Array} - Array of order objects
 */
export const getUserOrders = (userId) => {
  return orderManager.getOrdersByUserId(userId);
};
