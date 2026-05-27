import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, OneToMany
} from 'typeorm';
import { AvatarConfig } from './AvatarConfig';
import { Drawing } from './Drawing';
import { ForumPost } from './ForumPost';
import { ForumComment } from './ForumComment';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, length: 50 })
  name: string;

  @Column({ type: 'varchar', unique: true, length: 100 })
  email: string;

  @Column({ type: 'varchar' })
  passwordHash: string;

  @Column({ type: 'varchar', default: '' })
  bio: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => AvatarConfig, (config) => config.user, { cascade: true })
  avatarConfig: AvatarConfig;

  @OneToMany(() => Drawing, (drawing) => drawing.user)
  drawings: Drawing[];

  @OneToMany(() => ForumPost, (post) => post.user)
  forumPosts: ForumPost[];

  @OneToMany(() => ForumComment, (comment) => comment.user)
  forumComments: ForumComment[];
}
