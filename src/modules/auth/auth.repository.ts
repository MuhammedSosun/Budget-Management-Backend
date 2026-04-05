import User, { IUser } from '../../models/user.model';

export class AuthRepository {
  createUser(userData: Partial<IUser>) {
    return User.create(userData);
  }
  findUserByEmail(email: string) {
    return User.findOne({ email: email })
  }
  findAll() {
    return User.find({});
  }
  deleteUser(id: string) {
    return User.findByIdAndDelete(id);
  }
  findUserById(id: string) {
    return User.findById(id);
  }
  updateUser(id: string, userData: Partial<IUser>) {
    return User.findByIdAndUpdate(id, userData, { returnDocument: 'after' });
  }
}
