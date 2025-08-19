import ChatMessage from '@/models/ChatMessage';

class ChatMessageRepository {
  async findById(id: string) {
    return ChatMessage.findById(id);
  }
  async findByGroupAndDate(group: string, start: Date, end: Date) {
    return ChatMessage.find({
      group,
      timestamp: { $gte: start, $lt: end }
    })
      .sort({ timestamp: 1 })
      .limit(100)
      .lean();
  }
  async createMessage(data: any) {
    return ChatMessage.create(data);
  }
  async updateMessage(id: string, update: any) {
    return ChatMessage.findByIdAndUpdate(id, update, { new: true });
  }
  async deleteMessage(id: string) {
    return ChatMessage.findByIdAndDelete(id);
  }
}

export default new ChatMessageRepository();
