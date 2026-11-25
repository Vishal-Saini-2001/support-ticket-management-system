const env = require('../src/config/env');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');

async function seedAdmin() {
  try {
    await connectDB();

    const { name, email, password } = env.adminSeed;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
        console.log(`Updated existing user ${normalizedEmail} to admin role.`);
      } else {
        console.log(`Admin user ${normalizedEmail} already exists.`);
      }
    } else {
      await User.create({
        name,
        email: normalizedEmail,
        password,
        role: 'admin',
      });
      console.log(`Admin user created: ${normalizedEmail}`);
    }
  } catch (error) {
    console.error('Seed script failed:', error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

seedAdmin();

