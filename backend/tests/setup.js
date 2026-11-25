process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-jest-suite';

const { MongoMemoryServer } = require('mongodb-memory-server');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Ticket = require('../src/models/Ticket');
const Comment = require('../src/models/Comment');
const ActivityLog = require('../src/models/ActivityLog');
const Notification = require('../src/models/Notification');
const RevokedToken = require('../src/models/RevokedToken');

let mongoServer;

jest.setTimeout(60000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await connectDB(mongoServer.getUri());
  await Promise.all([
    User.init(),
    Ticket.init(),
    Comment.init(),
    ActivityLog.init(),
    Notification.init(),
    RevokedToken.init(),
  ]);
});

afterEach(async () => {
  await Promise.all([
    Notification.deleteMany({}),
    ActivityLog.deleteMany({}),
    Comment.deleteMany({}),
    Ticket.deleteMany({}),
    User.deleteMany({}),
    RevokedToken.deleteMany({}),
  ]);
});

afterAll(async () => {
  await disconnectDB();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

