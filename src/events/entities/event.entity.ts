import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

//Formation Note : In a real world application, we'd want to create and wrap this
//entire domain in a Nest module
@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  name: string;

  @Column('json')
  payload: Record<string, any>;
}
