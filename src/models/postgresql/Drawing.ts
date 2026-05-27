import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { User } from './User';
import { DailyBlot } from './DailyBlot';

export interface LineData {
  id: number;
  points: number[];
  color: string;
  size: number;
}

@Entity('drawings')
export class Drawing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  lines: LineData[];

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.drawings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => DailyBlot, (blot) => blot.drawings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blotId' })
  blot: DailyBlot;

  @Column({ type: 'uuid' })
  blotId: string;
}
