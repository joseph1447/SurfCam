import User from '@/models/User';

class UserRepository {
  async findById(id: string) {
    return User.findById(id);
  }
  async updateProfile(id: string, update: any) {
    return User.findByIdAndUpdate(id, update, { new: true });
  }
  async findByEmail(email: string) {
    return User.findOne({ email: email.toLowerCase() });
  }
  async createUser(data: any) {
    return User.create(data);
  }
}

export default new UserRepository();
