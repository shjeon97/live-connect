import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class SocketIoGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  //소켓 연결시
  handleConnection(client: Socket): void {
    console.log('connected', client.id);
  }

  //소켓 연결 해제시 제거
  handleDisconnect(client: Socket): void {
    console.log('disconnected', client.id);
  }
}
