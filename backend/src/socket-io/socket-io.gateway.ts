import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
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
    console.log('disconnected', socket.id);
  }

  @SubscribeMessage('getSocketId')
  handleMessage(@ConnectedSocket() socket: Socket) {
    socket.broadcast.emit('socketId');
    return socket.id;
  }
}
