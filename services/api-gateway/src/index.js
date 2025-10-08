const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 8080;

// Service URLs (resolved by Istio service discovery)
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:3002';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://order-service:3003';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

// User service routes
app.get('/users/:id', async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/users/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('User service error:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch user',
      details: error.message 
    });
  }
});

app.post('/users', async (req, res) => {
  try {
    const response = await axios.post(`${USER_SERVICE_URL}/users`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('User service error:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to create user',
      details: error.message 
    });
  }
});

// Product service routes
app.get('/products', async (req, res) => {
  try {
    const response = await axios.get(`${PRODUCT_SERVICE_URL}/products`);
    res.json(response.data);
  } catch (error) {
    console.error('Product service error:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch products',
      details: error.message 
    });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const response = await axios.get(`${PRODUCT_SERVICE_URL}/products/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Product service error:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch product',
      details: error.message 
    });
  }
});

// Order service routes
app.get('/orders', async (req, res) => {
  try {
    const response = await axios.get(`${ORDER_SERVICE_URL}/orders`);
    res.json(response.data);
  } catch (error) {
    console.error('Order service error:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch orders',
      details: error.message 
    });
  }
});

app.post('/orders', async (req, res) => {
  try {
    const response = await axios.post(`${ORDER_SERVICE_URL}/orders`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Order service error:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to create order',
      details: error.message 
    });
  }
});

// Payment service routes
app.post('/payments', async (req, res) => {
  try {
    const response = await axios.post(`${PAYMENT_SERVICE_URL}/payments`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Payment service error:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Failed to process payment',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: error.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path 
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log('Service URLs:');
  console.log(`  User Service: ${USER_SERVICE_URL}`);
  console.log(`  Product Service: ${PRODUCT_SERVICE_URL}`);
  console.log(`  Order Service: ${ORDER_SERVICE_URL}`);
  console.log(`  Payment Service: ${PAYMENT_SERVICE_URL}`);
});
