const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: '../.env' });
if (!process.env.MONGO_URI) dotenv.config();

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const connectDB = require('../config/db');

const sampleProducts = [
  {
    title: 'AeroFit Wireless Earbuds',
    description: 'Immersive sound with active noise cancellation and 30-hour battery life. Sweat resistant, built for the gym and beyond.',
    price: 79.99,
    category: 'Electronics',
    stock: 25,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop',
    rating: { average: 4.7, numReviews: 312 },
  },
  {
    title: 'UrbanTrek Backpack 24L',
    description: 'Weatherproof daypack with a padded laptop sleeve, hidden pocket, and breathable mesh straps for all-day comfort.',
    price: 54.5,
    category: 'Bags',
    stock: 40,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop',
    rating: { average: 4.4, numReviews: 198 },
  },
  {
    title: 'Chrono Steel Watch',
    description: 'Stainless steel chronograph with sapphire coated crystal glass, 100m water resistance, and a genuine leather strap.',
    price: 129.0,
    category: 'Accessories',
    stock: 15,
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=600&auto=format&fit=crop',
    rating: { average: 4.8, numReviews: 521 },
  },
  {
    title: 'CloudStep Running Shoes',
    description: 'Responsive foam cushioning with a breathable knit upper — built for daily runs and long miles alike.',
    price: 89.0,
    category: 'Footwear',
    stock: 30,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
    rating: { average: 4.6, numReviews: 276 },
  },
  {
    title: 'Minimalist Leather Wallet',
    description: 'Full-grain leather bifold wallet with RFID-blocking lining and a slim profile that fits any pocket.',
    price: 34.99,
    category: 'Accessories',
    stock: 50,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=600&auto=format&fit=crop',
    rating: { average: 4.3, numReviews: 143 },
  },
  {
    title: 'PulseCam Action Camera',
    description: '4K60 video, waterproof to 10m, and in-body stabilization for buttery smooth footage on any adventure.',
    price: 199.0,
    category: 'Electronics',
    stock: 18,
    image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=600&auto=format&fit=crop',
    rating: { average: 4.7, numReviews: 402 },
  },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shophive');
    console.log('✅ Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await Cart.deleteMany();

    console.log('🧹 Cleared existing database collections...');

    // Create Admin User
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@shophive.com',
      password: 'adminpassword123',
      phone: '+1 800-555-0199',
      address: { street: '100 Tech Blvd', city: 'San Francisco', state: 'CA', zipCode: '94105', country: 'USA' },
      role: 'admin',
    });

    // Create Standard User
    const standardUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'userpassword123',
      phone: '+1 555-0144',
      address: { street: '42 Market Street', city: 'New York', state: 'NY', zipCode: '10001', country: 'USA' },
      role: 'user',
    });

    // Create Sample Products
    const createdProducts = await Product.insertMany(sampleProducts);

    console.log(`\n🎉 Data Seeding Complete!`);
    console.log(`--------------------------------------------------`);
    console.log(`👤 Admin Account:    email: admin@shophive.com | password: adminpassword123`);
    console.log(`👤 Buyer Account:    email: john@example.com  | password: userpassword123`);
    console.log(`📦 Seeded Products:  ${createdProducts.length} items`);
    console.log(`--------------------------------------------------\n`);

    process.exit();
  } catch (error) {
    console.error(`❌ Data Seeding Failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
