import ChatGroup from '@/models/ChatGroup';
import bcrypt from 'bcryptjs';

class ChatGroupRepository {
  async findByName(name: string) {
    return ChatGroup.findOne({ name });
  }
  async addMember(groupId: string, userId: string) {
    return ChatGroup.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: userId } },
      { new: true }
    );
  }
  async createGroup({ name, password, createdBy }: { name: string, password: string, createdBy: string }) {
    const passwordHash = await bcrypt.hash(password, 10);
    return ChatGroup.create({ name, passwordHash, members: [], createdBy });
  }
  async changePassword(name: string, newPassword: string) {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    return ChatGroup.findOneAndUpdate({ name }, { passwordHash }, { new: true });
  }
  async isMember(name: string, userId: string) {
    const group = await ChatGroup.findOne({ name });
    if (!group) return false;
    return group.members.some((id: any) => id.toString() === userId);
  }
  async getAllGroups() {
    return ChatGroup.find({});
  }
}

export default new ChatGroupRepository();
