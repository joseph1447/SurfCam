import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import ChatMessageService from '../services/ChatMessageService';
import ChatMessage from '../models/ChatMessage';

describe('ChatMessageService', () => {
  let mongoServer: MongoMemoryServer;
  let userId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {});
    userId = new mongoose.Types.ObjectId().toString();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await ChatMessage.deleteMany({});
  });

  it('creates a new chat message', async () => {
    const msg = await ChatMessageService.createMessage({
      group: 'general',
      userId,
      username: 'testuser',
      message: 'Hello world!'
    });
    expect(msg.message).toBe('Hello world!');
    expect(msg.group).toBe('general');
  });

  it('gets messages for a group and date', async () => {
    const now = new Date();
    await ChatMessageService.createMessage({
      group: 'general',
      userId,
      username: 'testuser',
      message: 'Today message',
      timestamp: now
    });
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const messages = await ChatMessageService.getMessages({ group: 'general', startOfDay, endOfDay });
    expect(messages.length).toBe(1);
    expect(messages[0].message).toBe('Today message');
  });
});
