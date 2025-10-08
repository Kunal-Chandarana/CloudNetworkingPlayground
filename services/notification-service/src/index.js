const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory notification storage (for demo purposes)
let notifications = [];

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - Notification Service: ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'notification-service',
    timestamp: new Date().toISOString(),
    version: process.env.SERVICE_VERSION || 'v1'
  });
});

// Get all notifications
app.get('/notifications', (req, res) => {
  const { userId, type, limit = 50 } = req.query;
  
  let filteredNotifications = notifications;
  
  if (userId) {
    filteredNotifications = filteredNotifications.filter(n => n.userId === userId);
  }
  
  if (type) {
    filteredNotifications = filteredNotifications.filter(n => n.type === type);
  }
  
  // Sort by creation date (newest first)
  filteredNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // Apply limit
  filteredNotifications = filteredNotifications.slice(0, parseInt(limit));
  
  res.json({
    notifications: filteredNotifications,
    count: filteredNotifications.length,
    service: 'notification-service'
  });
});

// Get notification by ID
app.get('/notifications/:id', (req, res) => {
  const notification = notifications.find(n => n.id === req.params.id);
  
  if (!notification) {
    return res.status(404).json({ 
      error: 'Notification not found',
      id: req.params.id 
    });
  }
  
  res.json(notification);
});

// Send notification
app.post('/notifications', (req, res) => {
  const { userId, type, message, orderId, email, phone } = req.body;
  
  if (!userId || !type || !message) {
    return res.status(400).json({ 
      error: 'User ID, type, and message are required' 
    });
  }
  
  const notificationId = uuidv4();
  
  const notification = {
    id: notificationId,
    userId,
    type,
    message,
    orderId: orderId || null,
    email: email || null,
    phone: phone || null,
    status: 'sent',
    createdAt: new Date().toISOString(),
    service: 'notification-service'
  };
  
  notifications.push(notification);
  
  // Simulate sending notification (email, SMS, push, etc.)
  console.log(`📧 Sending ${type} notification to user ${userId}: ${message}`);
  
  // Simulate different notification channels based on type
  switch (type) {
    case 'order_confirmed':
      console.log(`📧 Email sent to ${email || 'user@example.com'}: Order confirmed`);
      break;
    case 'order_cancelled':
      console.log(`📧 Email sent to ${email || 'user@example.com'}: Order cancelled`);
      break;
    case 'order_shipped':
      console.log(`📱 SMS sent to ${phone || '+1234567890'}: Your order has shipped!`);
      break;
    case 'order_delivered':
      console.log(`🔔 Push notification sent: Your order has been delivered!`);
      break;
    case 'payment_failed':
      console.log(`📧 Email sent to ${email || 'user@example.com'}: Payment failed`);
      break;
    default:
      console.log(`📧 Generic notification sent: ${message}`);
  }
  
  res.status(201).json(notification);
});

// Mark notification as read
app.put('/notifications/:id/read', (req, res) => {
  const notification = notifications.find(n => n.id === req.params.id);
  
  if (!notification) {
    return res.status(404).json({ 
      error: 'Notification not found',
      id: req.params.id 
    });
  }
  
  notification.status = 'read';
  notification.readAt = new Date().toISOString();
  
  res.json(notification);
});

// Get unread notifications for user
app.get('/notifications/user/:userId/unread', (req, res) => {
  const unreadNotifications = notifications.filter(
    n => n.userId === req.params.userId && n.status === 'sent'
  );
  
  res.json({
    notifications: unreadNotifications,
    count: unreadNotifications.length,
    userId: req.params.userId
  });
});

// Send bulk notifications
app.post('/notifications/bulk', (req, res) => {
  const { notifications: notificationList } = req.body;
  
  if (!Array.isArray(notificationList)) {
    return res.status(400).json({ 
      error: 'Notifications must be an array' 
    });
  }
  
  const results = [];
  
  for (const notificationData of notificationList) {
    const { userId, type, message, orderId, email, phone } = notificationData;
    
    if (!userId || !type || !message) {
      results.push({
        error: 'User ID, type, and message are required',
        data: notificationData
      });
      continue;
    }
    
    const notificationId = uuidv4();
    
    const notification = {
      id: notificationId,
      userId,
      type,
      message,
      orderId: orderId || null,
      email: email || null,
      phone: phone || null,
      status: 'sent',
      createdAt: new Date().toISOString(),
      service: 'notification-service'
    };
    
    notifications.push(notification);
    results.push(notification);
    
    console.log(`📧 Bulk notification sent to user ${userId}: ${message}`);
  }
  
  res.status(201).json({
    results,
    count: results.length,
    service: 'notification-service'
  });
});

// Simulate service failure for testing circuit breaker
app.get('/notifications/fail', (req, res) => {
  res.status(500).json({ 
    error: 'Simulated notification service failure',
    service: 'notification-service',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Notification Service running on port ${PORT}`);
  console.log(`Service version: ${process.env.SERVICE_VERSION || 'v1'}`);
});
