import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('stats')
export class Stat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', unique: true })
  date: string;

  @Column({ type: 'int', default: 0 })
  totalDrawings: number;

  @Column({ type: 'int', default: 0 })
  todayDrawings: number;

  @Column({ type: 'int', default: 0 })
  totalUsers: number;

  @CreateDateColumn()
  createdAt: Date;
}
