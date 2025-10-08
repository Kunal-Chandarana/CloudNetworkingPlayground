const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory payment storage (for demo purposes)
let payments = [];

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - Payment Service: ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'payment-service',
    timestamp: new Date().toISOString(),
    version: process.env.SERVICE_VERSION || 'v1'
  });
});

// Process payment
app.post('/payments', (req, res) => {
  const { orderId, amount, currency = 'USD', paymentMethod, cardNumber } = req.body;
  
  if (!orderId || !amount || !paymentMethod) {
    return res.status(400).json({ 
      error: 'Order ID, amount, and payment method are required' 
    });
  }
  
  // Simulate payment processing
  const paymentId = uuidv4();
  const isSuccessful = Math.random() > 0.1; // 90% success rate
  
  const payment = {
    id: paymentId,
    orderId,
    amount: parseFloat(amount),
    currency,
    paymentMethod,
    status: isSuccessful ? 'completed' : 'failed',
    transactionId: isSuccessful ? `txn_${Date.now()}` : null,
    processedAt: new Date().toISOString(),
    service: 'payment-service'
  };
  
  payments.push(payment);
  
  if (isSuccessful) {
    res.status(201).json(payment);
  } else {
    res.status(402).json({
      ...payment,
      error: 'Payment failed - insufficient funds'
    });
  }
});

// Get payment by ID
app.get('/payments/:id', (req, res) => {
  const payment = payments.find(p => p.id === req.params.id);
  
  if (!payment) {
    return res.status(404).json({ 
      error: 'Payment not found',
      id: req.params.id 
    });
  }
  
  res.json(payment);
});

// Get payments by order ID
app.get('/payments/order/:orderId', (req, res) => {
  const orderPayments = payments.filter(p => p.orderId === req.params.orderId);
  
  res.json({
    payments: orderPayments,
    count: orderPayments.length,
    orderId: req.params.orderId
  });
});

// Refund payment
app.post('/payments/:id/refund', (req, res) => {
  const payment = payments.find(p => p.id === req.params.id);
  
  if (!payment) {
    return res.status(404).json({ 
      error: 'Payment not found',
      id: req.params.id 
    });
  }
  
  if (payment.status !== 'completed') {
    return res.status(400).json({ 
      error: 'Can only refund completed payments' 
    });
  }
  
  const refund = {
    id: uuidv4(),
    originalPaymentId: payment.id,
    amount: payment.amount,
    currency: payment.currency,
    status: 'refunded',
    refundedAt: new Date().toISOString(),
    service: 'payment-service'
  };
  
  payments.push(refund);
  
  res.json(refund);
});

// Simulate service failure for testing circuit breaker
app.get('/payments/fail', (req, res) => {
  res.status(500).json({ 
    error: 'Simulated payment service failure',
    service: 'payment-service',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Payment Service running on port ${PORT}`);
  console.log(`Service version: ${process.env.SERVICE_VERSION || 'v1'}`);
});
