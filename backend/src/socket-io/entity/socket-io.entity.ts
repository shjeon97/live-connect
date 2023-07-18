import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('socketIo')
export class SocketIo {
  @ApiProperty({ description: '소켓 ID' })
  @PrimaryColumn()
  clientId: string;

  @ApiProperty({ description: '사용자 이름' })
  @Column()
  userName: string;

  @ApiProperty({ description: '방 이름' })
  @Column()
  roomName: string;
}
