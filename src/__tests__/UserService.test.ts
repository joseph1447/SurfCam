import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import UserService from '../services/UserService';
import User from '../models/User';

describe('UserService', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {});
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('registers a new user', async () => {
    const user = await UserService.register({
      email: 'test@example.com',
      password: 'password',
      accessType: 'free',
      userAgent: 'jest',
      ipAddress: '127.0.0.1',
      loginTime: new Date(),
      deviceType: 'desktop',
      browser: 'Chrome',
      os: 'Windows'
    });
    expect(user.email).toBe('test@example.com');
    expect(user.accessType).toBe('free');
  });

  it('updates user profile', async () => {
    const user = await UserService.register({
      email: 'profile@example.com',
      password: 'password',
      accessType: 'free',
      userAgent: 'jest',
      ipAddress: '127.0.0.1',
      loginTime: new Date(),
      deviceType: 'desktop',
      browser: 'Chrome',
      os: 'Windows'
    });
    const updated = await UserService.updateProfile({
      userId: user._id,
      username: 'newname',
      instagram: 'https://instagram.com/testuser'
    });
    expect(updated.username).toBe('newname');
    expect(updated.instagram).toBe('https://instagram.com/testuser');
  });
});
