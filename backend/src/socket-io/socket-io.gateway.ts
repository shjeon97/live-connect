import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketIo } from './entity/socket-io.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@WebSocketGateway({ cors: true })
export class SocketIoGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @InjectRepository(SocketIo) private readonly socketIo: Repository<SocketIo>,
  ) {}

  @WebSocketServer()
  server: Server;

  //소켓 연결시
  handleConnection(socket: Socket): void {
    console.log('connected', socket.id);
  }

  //소켓 연결 해제시
  handleDisconnect(socket: Socket): void {
    try {
      console.log('disconnected', socket.id);
      this.socketIo.delete({ clientId: socket.id });
    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('createSocketIo')
  async handleMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomName: string; userName: string },
  ) {
    try {
      this.socketIo.save(
        this.socketIo.create({
          clientId: socket.id,
          roomName: data.roomName,
          userName: data.userName,
        }),
      );

      this.server.to(socket.id).emit('createSocketIo', {
        ok: true,
      });
    } catch (error) {
      console.log(error);
      this.server.to(socket.id).emit('createSocketIo', {
        ok: false,
        error,
      });
    }
  }
}
