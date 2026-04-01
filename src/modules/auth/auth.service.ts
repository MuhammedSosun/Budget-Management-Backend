import { AuthRepository } from './auth.repository';
import bcrypt from 'bcrypt';

export class AuthService {
  private authRepository = new AuthRepository();

  async register(username: string, password: string) {
    return await this.authRepository.createUser({ username, password });
  }
  async login(username: string, password: string) {
    const user = await this.authRepository.findUserByUsername(username);
    if (!user) {
      throw new Error('user Not Found');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Kullanıcı adı veya şifre hatalı!');
    }
    return user;
  }
  async findAll() {
    const users = await this.authRepository.findAll();
    if (!users) {
      throw new Error('Kullanıcı bulunamadı');
    }
    return users;
  }
  async deleteUserById(id: string) {
    const user = await this.authRepository.deleteUser(id);
    if (!user) {
      throw new Error("Kullanıcı bulunamadı")
    }
    return user;
  }
  async updateUser(id: string, username: string, password: string) {
    const user = await this.authRepository.findUserById(id);
    const hashedPassword = await bcrypt.hash(password, 10);
    if (!user) {
      throw new Error("Kullanıcı bulunamadı")
    }
    const updatedUser = await this.authRepository.updateUser(id, { username, password: hashedPassword });
    return updatedUser;
  }
}