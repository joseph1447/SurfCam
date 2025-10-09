import ChatMessageRepository from '@/repositories/ChatMessageRepository';

class ChatMessageService {
  async getMessages({ group, startOfDay, endOfDay }: { group: string, startOfDay: Date, endOfDay: Date }) {
    return await ChatMessageRepository.findByGroupAndDate(group, startOfDay, endOfDay);
  }
  async createMessage(data: any) {
    // Add validation if needed
    return await ChatMessageRepository.createMessage(data);
  }
  async editMessage({ id, userId, message }: { id: string, userId: string, message: string }) {
    const chatMsg = await ChatMessageRepository.findById(id);
    if (!chatMsg) throw new Error('Mensaje no encontrado');
    if (String(chatMsg.userId) !== userId) throw new Error('No autorizado');
    const now = Date.now();
    const sent = new Date(chatMsg.timestamp).getTime();
    if (now - sent > 5 * 60 * 1000) throw new Error('Solo puedes editar durante los primeros 5 minutos');
    chatMsg.message = message;
    chatMsg.edited = true;
    await chatMsg.save();
    return chatMsg;
  }
  async deleteMessage({ id, userEmail, adminEmail }: { id: string, userEmail: string, adminEmail: string }) {
    if (userEmail !== adminEmail) throw new Error('No autorizado');
    const deleted = await ChatMessageRepository.deleteMessage(id);
    if (!deleted) throw new Error('Mensaje no encontrado');
    return deleted;
  }
}

export default new ChatMessageService();
