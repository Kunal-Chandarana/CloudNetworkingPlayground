const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3003;

// Service URLs (resolved by Istio service discovery)
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory order storage (for demo purposes)
let orders = [];

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - Order Service: ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'order-service',
    timestamp: new Date().toISOString(),
    version: process.env.SERVICE_VERSION || 'v1'
  });
});

// Get all orders
app.get('/orders', (req, res) => {
  res.json({
    orders,
    count: orders.length,
    service: 'order-service'
  });
});

// Get order by ID
app.get('/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  
  if (!order) {
    return res.status(404).json({ 
      error: 'Order not found',
      id: req.params.id 
    });
  }
  
  res.json(order);
});

// Create new order
app.post('/orders', async (req, res) => {
  const { userId, items, shippingAddress, paymentMethod } = req.body;
  
  if (!userId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ 
      error: 'User ID and items are required' 
    });
  }
  
  const orderId = uuidv4();
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const order = {
    id: orderId,
    userId,
    items,
    totalAmount,
    status: 'pending',
    shippingAddress: shippingAddress || {},
    paymentMethod: paymentMethod || 'credit_card',
    createdAt: new Date().toISOString(),
    service: 'order-service'
  };
  
  orders.push(order);
  
  try {
    // Process payment
    const paymentResponse = await axios.post(`${PAYMENT_SERVICE_URL}/payments`, {
      orderId,
      amount: totalAmount,
      paymentMethod
    });
    
    if (paymentResponse.status === 201) {
      // Payment successful
      order.status = 'confirmed';
      order.paymentId = paymentResponse.data.id;
      order.confirmedAt = new Date().toISOString();
      
      // Send notification
      try {
        await axios.post(`${NOTIFICATION_SERVICE_URL}/notifications`, {
          userId,
          type: 'order_confirmed',
          message: `Your order #${orderId} has been confirmed!`,
          orderId
        });
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError.message);
        // Don't fail the order if notification fails
      }
      
      res.status(201).json(order);
    } else {
      // Payment failed
      order.status = 'payment_failed';
      order.paymentError = paymentResponse.data.error;
      
      res.status(402).json(order);
    }
  } catch (paymentError) {
    console.error('Payment service error:', paymentError.message);
    order.status = 'payment_failed';
    order.paymentError = 'Payment service unavailable';
    
    res.status(503).json(order);
  }
});

// Update order status
app.put('/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const order = orders.find(o => o.id === req.params.id);
  
  if (!order) {
    return res.status(404).json({ 
      error: 'Order not found',
      id: req.params.id 
    });
  }
  
  const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status',
      validStatuses 
    });
  }
  
  order.status = status;
  order.updatedAt = new Date().toISOString();
  
  res.json(order);
});

// Cancel order
app.post('/orders/:id/cancel', async (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  
  if (!order) {
    return res.status(404).json({ 
      error: 'Order not found',
      id: req.params.id 
    });
  }
  
  if (order.status === 'delivered') {
    return res.status(400).json({ 
      error: 'Cannot cancel delivered order' 
    });
  }
  
  // If payment was completed, process refund
  if (order.paymentId && order.status === 'confirmed') {
    try {
      await axios.post(`${PAYMENT_SERVICE_URL}/payments/${order.paymentId}/refund`);
    } catch (refundError) {
      console.error('Refund failed:', refundError.message);
      // Continue with cancellation even if refund fails
    }
  }
  
  order.status = 'cancelled';
  order.cancelledAt = new Date().toISOString();
  
  // Send cancellation notification
  try {
    await axios.post(`${NOTIFICATION_SERVICE_URL}/notifications`, {
      userId: order.userId,
      type: 'order_cancelled',
      message: `Your order #${order.id} has been cancelled.`,
      orderId: order.id
    });
  } catch (notificationError) {
    console.error('Failed to send cancellation notification:', notificationError.message);
  }
  
  res.json(order);
});

// Simulate service failure for testing circuit breaker
app.get('/orders/fail', (req, res) => {
  res.status(500).json({ 
    error: 'Simulated order service failure',
    service: 'order-service',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Order Service running on port ${PORT}`);
  console.log(`Service version: ${process.env.SERVICE_VERSION || 'v1'}`);
  console.log('Service URLs:');
  console.log(`  Payment Service: ${PAYMENT_SERVICE_URL}`);
  console.log(`  Notification Service: ${NOTIFICATION_SERVICE_URL}`);
});
