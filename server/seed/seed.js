/**
 * Seed script – populates the database with sample data.
 * Run: npm run seed (from /server directory)
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const Resource = require('../models/Resource');
const Order = require('../models/Order');
const ForumPost = require('../models/ForumPost');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Farm.deleteMany({}),
      Crop.deleteMany({}),
      Resource.deleteMany({}),
      Order.deleteMany({}),
      ForumPost.deleteMany({}),
    ]);
    console.log('Cleared existing data.');

    // Create users
    const admin = await User.create({
      name: 'Admin AgriTech',
      email: 'admin@agritech.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '9876543210',
      language: 'en',
    });

    const farmer = await User.create({
      name: 'Rajesh Kumar',
      email: 'farmer@agritech.com',
      password: 'Farmer@123',
      role: 'farmer',
      phone: '9123456780',
      language: 'hi',
    });

    console.log('Created users: admin@agritech.com (Admin@123), farmer@agritech.com (Farmer@123)');

    // Create farms
    const farm1 = await Farm.create({
      owner: farmer._id,
      name: 'Green Valley Farm',
      location: { district: 'Nashik', state: 'Maharashtra', coordinates: { lat: 20.0, lng: 73.78 } },
      size: 12,
      sizeUnit: 'acres',
      soilType: 'loamy',
      waterSource: 'well',
    });

    const farm2 = await Farm.create({
      owner: farmer._id,
      name: 'Sunrise Fields',
      location: { district: 'Pune', state: 'Maharashtra', coordinates: { lat: 18.52, lng: 73.85 } },
      size: 8,
      sizeUnit: 'acres',
      soilType: 'clay',
      waterSource: 'canal',
    });

    console.log('Created 2 farms.');

    // Create crops
    const crop1 = await Crop.create({
      farm: farm1._id,
      user: farmer._id,
      name: 'Wheat',
      variety: 'HD-2967',
      sowingDate: new Date('2026-06-15'),
      expectedHarvest: new Date('2026-11-15'),
      status: 'growing',
      soilHealth: { pH: 6.8, nitrogen: 35, phosphorus: 22, potassium: 28, moisture: 55 },
      growthLogs: [
        { date: new Date('2026-06-20'), stage: 'Germination', notes: 'Seeds have germinated well' },
        { date: new Date('2026-07-15'), stage: 'Tillering', notes: 'Good tiller development' },
        { date: new Date('2026-08-20'), stage: 'Stem Extension', notes: 'Healthy growth observed' },
      ],
    });

    const crop2 = await Crop.create({
      farm: farm1._id,
      user: farmer._id,
      name: 'Tomato',
      variety: 'Pusa Ruby',
      sowingDate: new Date('2026-07-01'),
      expectedHarvest: new Date('2026-10-01'),
      status: 'harvested',
      soilHealth: { pH: 6.2, nitrogen: 42, phosphorus: 18, potassium: 35, moisture: 62 },
      growthLogs: [
        { date: new Date('2026-07-10'), stage: 'Seedling', notes: 'Transplanted to field' },
        { date: new Date('2026-08-05'), stage: 'Flowering', notes: 'Flowers appearing' },
        { date: new Date('2026-09-15'), stage: 'Fruiting', notes: 'Good yield expected' },
      ],
    });

    const crop3 = await Crop.create({
      farm: farm2._id,
      user: farmer._id,
      name: 'Rice',
      variety: 'Basmati 370',
      sowingDate: new Date('2026-06-01'),
      expectedHarvest: new Date('2026-10-30'),
      status: 'growing',
      soilHealth: { pH: 5.8, nitrogen: 28, phosphorus: 15, potassium: 20, moisture: 75 },
      growthLogs: [
        { date: new Date('2026-06-10'), stage: 'Nursery', notes: 'Seeds in nursery bed' },
        { date: new Date('2026-07-01'), stage: 'Transplanting', notes: 'Transplanted to paddy field' },
      ],
    });

    console.log('Created 3 crops.');

    // Create resources
    const resources = await Resource.insertMany([
      { name: 'Wheat Seeds (HD-2967)', category: 'seed', description: 'High-yield wheat variety suitable for irrigated conditions. Resistant to rust.', price: 450, stock: 200, unit: 'kg', approved: true, createdBy: admin._id },
      { name: 'Basmati Rice Seeds', category: 'seed', description: 'Premium basmati rice seeds with excellent aroma and grain length.', price: 680, stock: 150, unit: 'kg', approved: true, createdBy: admin._id },
      { name: 'Hybrid Tomato Seeds', category: 'seed', description: 'High-yield hybrid tomato seeds, disease resistant.', price: 320, stock: 100, unit: 'packet', approved: true, createdBy: admin._id },
      { name: 'Urea (46% N)', category: 'fertilizer', description: 'Nitrogen-rich fertilizer for vegetative growth. Apply during tillering stage.', price: 270, stock: 500, unit: 'kg', approved: true, createdBy: admin._id },
      { name: 'DAP Fertilizer', category: 'fertilizer', description: 'Diammonium Phosphate – provides nitrogen and phosphorus for healthy root development.', price: 1350, stock: 300, unit: 'bag (50kg)', approved: true, createdBy: admin._id },
      { name: 'Neem Oil Pesticide', category: 'pesticide', description: 'Organic neem-based pesticide effective against aphids, whiteflies, and mites.', price: 380, stock: 80, unit: 'litre', approved: true, createdBy: admin._id },
      { name: 'Chlorpyrifos 20% EC', category: 'pesticide', description: 'Broad-spectrum insecticide for soil and foliar pests.', price: 520, stock: 60, unit: 'litre', approved: true, createdBy: admin._id },
      { name: 'Hand Sprayer (16L)', category: 'equipment', description: 'Manual backpack sprayer for pesticide and fertilizer application. 16-litre capacity.', price: 1800, stock: 25, unit: 'piece', approved: true, createdBy: admin._id },
      { name: 'Drip Irrigation Kit', category: 'equipment', description: 'Complete drip irrigation kit for 1 acre. Saves water and improves yield.', price: 12500, stock: 10, unit: 'kit', approved: true, createdBy: admin._id },
      { name: 'Organic Compost', category: 'fertilizer', description: 'Rich organic compost made from farm waste. Improves soil structure.', price: 200, stock: 0, unit: 'kg', approved: false, createdBy: farmer._id },
    ]);

    console.log('Created 10 resources (9 approved, 1 pending).');

    // Create a sample order
    await Order.create({
      user: farmer._id,
      items: [
        { resource: resources[0]._id, name: resources[0].name, quantity: 10, price: resources[0].price },
        { resource: resources[3]._id, name: resources[3].name, quantity: 5, price: resources[3].price },
      ],
      totalAmount: 10 * resources[0].price + 5 * resources[3].price,
      status: 'confirmed',
      shippingAddress: 'Village Sinnar, Nashik, Maharashtra 422103',
    });

    console.log('Created 1 sample order.');

    // Create forum posts
    await ForumPost.create({
      author: farmer._id,
      title: 'Best practices for wheat cultivation in Rabi season',
      content: 'I have been growing wheat for the past 5 years. Here are some tips I have learned:\n\n1. Sow seeds by mid-November\n2. Apply first irrigation 21 days after sowing\n3. Use balanced fertilization\n4. Watch for yellow rust during January\n\nWhat are your experiences?',
      category: 'crops',
      comments: [
        { author: admin._id, content: 'Great tips! I would also add that seed treatment with fungicide before sowing can prevent many soil-borne diseases.', createdAt: new Date() },
      ],
    });

    await ForumPost.create({
      author: admin._id,
      title: 'How to identify and control aphids in mustard crops',
      content: 'Aphids are a major pest in mustard crops during winter. Here are identification tips and control measures:\n\n**Identification:** Small green or black insects on tender shoots and undersides of leaves.\n\n**Control:**\n- Spray neem oil (2ml/litre)\n- Use yellow sticky traps\n- Release ladybird beetles (natural predators)\n- Chemical control: Imidacloprid 17.8% SL',
      category: 'pest-control',
    });

    await ForumPost.create({
      author: farmer._id,
      title: 'Need advice: drip irrigation for tomato farm',
      content: 'I am planning to install drip irrigation for my 2-acre tomato field. Can anyone suggest the right spacing and drip rate? Also, is the upfront cost worth it?',
      category: 'consultation',
      comments: [
        { author: admin._id, content: 'Drip irrigation typically pays for itself in 2-3 seasons through water savings and yield improvement. For tomatoes, use 60cm dripper spacing with 4 LPH drippers.', createdAt: new Date() },
      ],
    });

    console.log('Created 3 forum posts.');
    console.log('\n✅ Seed completed successfully!');
    console.log('Admin login: admin@agritech.com / Admin@123');
    console.log('Farmer login: farmer@agritech.com / Farmer@123\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
