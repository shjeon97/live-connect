import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class SocketIoGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
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
