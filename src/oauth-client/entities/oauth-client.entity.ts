import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ClientStatusEnum {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
}

@Entity('oauth_clients')
export class OAuthClient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  clientId: string;

  @Column()
  clientSecret: string;

  @Column()
  redirectUri: string;

  @Column({
    type: 'enum',
    enum: ClientStatusEnum,
    default: ClientStatusEnum.ACTIVE,
  })
  status: ClientStatusEnum;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
