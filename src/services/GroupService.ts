import ChatGroupRepository from '@/repositories/ChatGroupRepository';
import bcrypt from 'bcryptjs';

class GroupService {
  async joinGroup({ groupName, password, userId }: { groupName: string, password: string, userId: string }) {
    const group = await ChatGroupRepository.findByName(groupName);
    if (!group) throw new Error('Grupo no encontrado');
    if (group.members.some((id: any) => id.toString() === userId)) {
      return { alreadyMember: true };
    }
    const isMatch = await bcrypt.compare(password, group.passwordHash);
    if (!isMatch) throw new Error('Contraseña incorrecta');
    await ChatGroupRepository.addMember(group._id, userId);
    return { success: true };
  }
  async createGroup({ name, password, createdBy }: { name: string, password: string, createdBy: string }) {
    const existing = await ChatGroupRepository.findByName(name);
    if (existing) throw new Error('Ya existe un grupo con ese nombre');
    await ChatGroupRepository.createGroup({ name, password, createdBy });
    return { success: true };
  }
  async changePassword({ name, newPassword }: { name: string, newPassword: string }) {
    const group = await ChatGroupRepository.findByName(name);
    if (!group) throw new Error('Grupo no encontrado');
    await ChatGroupRepository.changePassword(name, newPassword);
    return { success: true };
  }
  async isMember({ name, userId }: { name: string, userId: string }) {
    return await ChatGroupRepository.isMember(name, userId);
  }
  async getAllGroups() {
    return await ChatGroupRepository.getAllGroups();
  }
}

export default new GroupService();
