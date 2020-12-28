import {
  BaseEntity, Column, Entity, PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export default class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  dId!: string;

  @Column()
  type!: string;

  @Column()
  channel!: string;

  @Column()
  guild!: string;
}
