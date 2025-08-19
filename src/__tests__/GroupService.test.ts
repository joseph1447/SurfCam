import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import GroupService from '../services/GroupService';
import ChatGroup from '../models/ChatGroup';
import User from '../models/User';

describe('GroupService', () => {
  let mongoServer: MongoMemoryServer;
  let userId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {});
    const user = await User.create({ email: 'admin@group.com', accessType: 'free' });
    userId = user._id.toString();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await ChatGroup.deleteMany({});
  });

  it('creates a new group', async () => {
    const result = await GroupService.createGroup({ name: 'TestGroup', password: 'secret', createdBy: userId });
    expect(result.success).toBe(true);
    const group = await ChatGroup.findOne({ name: 'TestGroup' });
    expect(group).toBeTruthy();
    expect(group?.createdBy.toString()).toBe(userId);
  });

  it('prevents duplicate group creation', async () => {
    await GroupService.createGroup({ name: 'TestGroup', password: 'secret', createdBy: userId });
    await expect(GroupService.createGroup({ name: 'TestGroup', password: 'secret', createdBy: userId }))
      .rejects.toThrow('Ya existe un grupo con ese nombre');
  });
});
