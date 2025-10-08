const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory user storage (for demo purposes)
let users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'customer',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'admin',
    createdAt: new Date().toISOString()
  }
];

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - User Service: ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'user-service',
    timestamp: new Date().toISOString(),
    version: process.env.SERVICE_VERSION || 'v1'
  });
});

// Get all users
app.get('/users', (req, res) => {
  res.json({
    users,
    count: users.length,
    service: 'user-service'
  });
});

// Get user by ID
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  
  if (!user) {
    return res.status(404).json({ 
      error: 'User not found',
      id: req.params.id 
    });
  }
  
  res.json({
    ...user,
    service: 'user-service',
    requestedAt: new Date().toISOString()
  });
});

// Create new user
app.post('/users', (req, res) => {
  const { name, email, role = 'customer' } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ 
      error: 'Name and email are required' 
    });
  }
  
  const newUser = {
    id: uuidv4(),
    name,
    email,
    role,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  res.status(201).json({
    ...newUser,
    service: 'user-service'
  });
});

// Update user
app.put('/users/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.params.id);
  
  if (userIndex === -1) {
    return res.status(404).json({ 
      error: 'User not found',
      id: req.params.id 
    });
  }
  
  const updatedUser = {
    ...users[userIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  users[userIndex] = updatedUser;
  
  res.json({
    ...updatedUser,
    service: 'user-service'
  });
});

// Delete user
app.delete('/users/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.params.id);
  
  if (userIndex === -1) {
    return res.status(404).json({ 
      error: 'User not found',
      id: req.params.id 
    });
  }
  
  users.splice(userIndex, 1);
  
  res.json({ 
    message: 'User deleted successfully',
    id: req.params.id,
    service: 'user-service'
  });
});

// Simulate service failure for testing circuit breaker
app.get('/users/fail', (req, res) => {
  res.status(500).json({ 
    error: 'Simulated service failure',
    service: 'user-service',
    timestamp: new Date().toISOString()
  });
});

// Simulate slow response for testing timeouts
app.get('/users/slow', (req, res) => {
  setTimeout(() => {
    res.json({ 
      message: 'Slow response',
      service: 'user-service',
      delay: '5 seconds',
      timestamp: new Date().toISOString()
    });
  }, 5000);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`User Service running on port ${PORT}`);
  console.log(`Service version: ${process.env.SERVICE_VERSION || 'v1'}`);
});
