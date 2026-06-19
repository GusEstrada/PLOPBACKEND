import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('avatar_configs')
export class AvatarConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', default: '' })
  headUrl: string;

  @Column({ type: 'varchar', default: '' })
  eyesUrl: string;

  @Column({ type: 'varchar', default: '' })
  mouthUrl: string;

  @Column({ type: 'varchar', default: '' })
  accessoryUrl: string;

  @Column({ type: 'varchar', default: '#FFD5C2' })
  skinColor: string;

  @OneToOne(() => User, (user) => user.avatarConfig, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;
}
