import UserRepository from '@/repositories/UserRepository';
import bcrypt from 'bcryptjs';

class UserService {
  async updateProfile({ userId, username, instagram }: { userId: string, username?: string, instagram?: string }) {
    const update: any = {};
    if (username) update.username = username;
    if (instagram !== undefined) update.instagram = instagram;
    const user = await UserRepository.updateProfile(userId, update);
    if (!user) throw new Error('Usuario no encontrado');
    return user;
  }

  async register({ email, password, accessType, userAgent, ipAddress, loginTime, ...rest }: any) {
    let user = await UserRepository.findByEmail(email);
    if (user) {
      // Update logic for existing user
      if (accessType === 'premium' && user.accessType !== 'premium') {
        user.accessType = 'premium';
        if (password) {
          user.password = await bcrypt.hash(password, 12);
        }
      }
      user.loginCount = (user.loginCount || 0) + 1;
      user.lastLogin = loginTime;
      user.lastActivity = loginTime;
      // ... (other stats logic, omitted for brevity)
      user.sessionHistory.push({ loginTime, userAgent, ipAddress, ...rest });
      if (user.sessionHistory.length > 50) {
        user.sessionHistory = user.sessionHistory.slice(-50);
      }
      await user.save();
      return user;
    } else {
      const hashedPassword = password ? await bcrypt.hash(password, 12) : undefined;
      const newUser = await UserRepository.createUser({
        email: email.toLowerCase(),
        accessType: accessType || 'free',
        password: hashedPassword,
        lastLogin: loginTime,
        loginCount: 1,
        sessionHistory: [{ loginTime, userAgent, ipAddress, ...rest }],
        // ... (other stats logic, omitted for brevity)
      });
      return newUser;
    }
  }
}

export default new UserService();
