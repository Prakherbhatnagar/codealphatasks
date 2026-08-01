const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

let PORT = parseInt(process.env.PORT, 10) || 5000;

// Connect to MongoDB Database
connectDB();

// Start Server with Auto-Port Fallback if Port is Occupied
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 ShopHive E-Commerce REST API is Live!`);
    console.log(`📡 Server running in [${process.env.NODE_ENV || 'development'}] mode`);
    console.log(`👉 Access URL: http://localhost:${port}`);
    console.log(`==================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`\n⚠️  Port ${port} is occupied.`);
      const nextPort = port + 1;
      console.log(`🔄 Retrying server startup on port ${nextPort}...\n`);
      setTimeout(() => startServer(nextPort), 500);
    } else {
      console.error('Server execution error:', err);
    }
  });
};

startServer(PORT);
