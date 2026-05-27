import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Drawing } from './Drawing';

@Entity('daily_blots')
export class DailyBlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', unique: true })
  date: string;

  @Column({ type: 'jsonb', nullable: true })
  mainBlot: number[];

  @Column({ type: 'jsonb', nullable: true })
  satellites: { x: number; y: number; r: number }[];

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Drawing, (drawing) => drawing.blot)
  drawings: Drawing[];
}
