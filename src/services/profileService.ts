import { AppDataSource } from '../config/database';
import { User } from '../models/postgresql/User';
import { AvatarConfig } from '../models/postgresql/AvatarConfig';

const userRepo = () => AppDataSource.getRepository(User);
const avatarRepo = () => AppDataSource.getRepository(AvatarConfig);

export const profileService = {
  async getProfile(userId: string) {
    const user = await userRepo().findOne({
      where: { id: userId },
      relations: ['avatarConfig'],
    });
    if (!user) throw new Error('Usuario no encontrado');
    return user;
  },

  async updateProfile(userId: string, data: { name?: string; bio?: string }) {
    const user = await userRepo().findOne({ where: { id: userId } });
    if (!user) throw new Error('Usuario no encontrado');

    if (data.name) user.name = data.name;
    if (data.bio !== undefined) user.bio = data.bio;

    await userRepo().save(user);
    return user;
  },

  async updateAvatar(userId: string, data: {
    headUrl?: string;
    eyesUrl?: string;
    mouthUrl?: string;
    accessoryUrl?: string;
    skinColor?: string;
  }) {
    let avatar = await avatarRepo().findOne({ where: { userId } });
    if (!avatar) {
      avatar = avatarRepo().create({ userId });
    }

    if (data.headUrl !== undefined) avatar.headUrl = data.headUrl;
    if (data.eyesUrl !== undefined) avatar.eyesUrl = data.eyesUrl;
    if (data.mouthUrl !== undefined) avatar.mouthUrl = data.mouthUrl;
    if (data.accessoryUrl !== undefined) avatar.accessoryUrl = data.accessoryUrl;
    if (data.skinColor !== undefined) avatar.skinColor = data.skinColor;

    await avatarRepo().save(avatar);
    return avatar;
  },
};
