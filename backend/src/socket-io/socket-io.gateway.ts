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
import { MoreThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import * as moment from 'moment';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class SocketIoGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @InjectRepository(SocketIo) private readonly socketIo: Repository<SocketIo>,
  ) {}
  private readonly logger = new Logger(SocketIoGateway.name);

  @WebSocketServer()
  server: Server;

  //소켓 연결시
  handleConnection(socket: Socket): void {
    this.logger.log('connected', socket.id);
  }

  //소켓 연결 해제시c
  handleDisconnect(socket: Socket): void {
    try {
      this.logger.log('disconnected', socket.id);
      this.socketIo.delete({ clientId: socket.id });
    } catch (error) {
      this.logger.error(error);
    }
  }

  @Cron('0 0 4 * * *')
  handleCron() {
    const twoDaysAgo = moment().subtract(2, 'days').toDate();
    this.socketIo.delete({ createdAt: MoreThanOrEqual(twoDaysAgo) });
    this.logger.debug('Delete socketIo entities created 2 days ago');
  }

  @SubscribeMessage('createSocketIo')
  async createSocketIo(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomName: string; userName: string },
  ) {
    try {
      const exist = await this.socketIo.findOne({
        where: { roomName: data.roomName, userName: data.userName },
      });
      if (exist) {
        return this.server.to(socket.id).emit('createSocketIo', {
          ok: false,
          error: 'This name is already in use. Please use a different name.',
        });
      }

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
      this.logger.error(error);
      this.server.to(socket.id).emit('createSocketIo', {
        ok: false,
        error,
      });
    }
  }
  @SubscribeMessage('enterTheRoom')
  async enterTheRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { roomName: string; userName: string },
  ) {
    try {
      const socketIo = await this.socketIo.findOne({
        where: { userName: data.userName, roomName: data.roomName },
      });

      if (!socketIo) {
        this.socketIo.save(
          this.socketIo.create({
            clientId: socket.id,
            roomName: data.roomName,
            userName: data.userName,
          }),
        );
      } else {
        if (socketIo.clientId !== socket.id) {
          socketIo.clientId = socket.id;
          this.socketIo.save(socketIo);
        }

        this.server.to(socket.id).emit('enterTheRoom', {
          ok: true,
        });
      }
    } catch (error) {
      this.logger.error(error);
      this.server.to(socket.id).emit('enterTheRoom', {
        ok: false,
        error: 'error while entering the room',
      });
    }
  }
}
