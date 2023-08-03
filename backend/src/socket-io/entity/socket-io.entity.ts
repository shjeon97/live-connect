import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('socketIo')
export class SocketIo {
  @ApiProperty({ description: '소켓 ID' })
  @Column()
  clientId: string;

  @ApiProperty({ description: '사용자 이름' })
  @PrimaryColumn()
  userName: string;

  @ApiProperty({ description: '방 이름' })
  @PrimaryColumn()
  roomName: string;

  @ApiProperty({ description: '생성일' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '마지막 수정일' })
  @UpdateDateColumn()
  updatedAt: Date;
}
