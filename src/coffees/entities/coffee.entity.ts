import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Flavor } from './flavor.entity';

//@Index(['name', 'type']) - composite indexes
@Entity()
export class Coffee {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  name: string;

  @Column()
  brand: string;

  @Column({ default: 0 })
  recommendations: number;

  @JoinTable()
  @ManyToMany(type => Flavor, (flavor) => flavor.coffees, {
    cascade: true, // ['insert]
  })
  flavors: Flavor[];
}
