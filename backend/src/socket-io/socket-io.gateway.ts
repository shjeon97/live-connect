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
import { instrument } from '@socket.io/admin-ui';

@WebSocketGateway({ cors: true })
export class SocketIoGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @InjectRepository(SocketIo) private readonly socketIo: Repository<SocketIo>,
  ) {}
  private readonly logger = new Logger(SocketIoGateway.name);

  afterInit() {
    instrument(this.server, {
      auth: false,
      mode: 'development',
    });
  }

  @WebSocketServer()
  server: Server;

  //소켓 연결시
  handleConnection(socket: Socket): void {
    this.logger.log('connected', socket.id);
  }

  //소켓 연결 해제시
  async handleDisconnect(socket: Socket): Promise<void> {
    try {
      this.logger.log('disconnected', socket.id);
      const socketIo = await this.socketIo.findOne({
        where: { clientId: socket.id },
      });
      this.server.to(socketIo.roomName).emit('userExitTheRoom', {
        userName: socketIo.userName,
        totalUsersCount: await this.totalCountOfUsersInTheRoom(
          socketIo.roomName,
        ),
      });
      this.socketIo.delete(socketIo);
    } catch (error) {
      this.logger.error(error);
    }
  }

  async totalCountOfUsersInTheRoom(roomName: string): Promise<number | null> {
    return this.server.sockets.adapter.rooms.get(roomName)?.size;
  }

  @Cron('0 0 4 * * *')
  handleCronDeleteSocketIo() {
    const twoDaysAgo = moment().subtract(2, 'days').toDate();
    this.socketIo.delete({ createdAt: MoreThanOrEqual(twoDaysAgo) });
    this.logger.debug('Delete socketIo entities created 2 days ago');
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
          // socketId: socket.id,
        });

        socket.join(data.roomName);
      }
    } catch (error) {
      this.logger.error(error);
      this.server.to(socket.id).emit('enterTheRoom', {
        ok: false,
        error: 'Error while entering the room',
      });
    }
  }

  @SubscribeMessage('userEnterTheRoom')
  async userEnterTheRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    data: { roomName: string; userName: string },
  ) {
    try {
      socket.broadcast.to(data.roomName).emit('userEnterTheRoom', {
        ok: true,
        userName: data.userName,
        totalUsersCount: await this.totalCountOfUsersInTheRoom(data.roomName),
      });
    } catch (error) {
      this.logger.error(error);
      socket.broadcast.to(data.roomName).emit('userEnterTheRoom', {
        ok: false,
        error: 'Error user entered the room',
      });
    }
  }

  @SubscribeMessage('findSocketIo')
  async findSocketIo(@ConnectedSocket() socket: Socket) {
    try {
      const socketIo = await this.socketIo.findOne({
        where: { clientId: socket.id },
      });
      if (!socketIo) {
        this.server.to(socket.id).emit('exitTheRoom');
      }
    } catch (error) {
      this.logger.error(error);
      this.server.to(socket.id).emit('exitTheRoom');
    }
  }

  @SubscribeMessage('sendRoomMessage')
  async sendRoomMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    data: { roomName: string; userName: string; message: string },
  ) {
    try {
      this.server.to(data.roomName).emit('sendRoomMessage', {
        ok: true,
        type: 'message',
        userName: data.userName,
        message: data.message,
      });
    } catch (error) {
      this.logger.error(error);
      this.server.to(socket.id).emit('sendRoomMessage', {
        ok: false,
        error: 'Fail send message.',
      });
    }
  }

  @SubscribeMessage('offer')
  async offer(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    data: { offer: any; roomName: string },
  ) {
    try {
      socket.broadcast.to(data.roomName).emit('offer', {
        ok: true,
        offer: data.offer,
      });
    } catch (error) {
      this.logger.error(error);
      socket.broadcast.to(data.roomName).emit('offer', {
        ok: false,
        error: 'Fail offer',
      });
    }
  }

  @SubscribeMessage('answer')
  async answer(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    data: { answer: any; roomName: string },
  ) {
    try {
      socket.broadcast.to(data.roomName).emit('answer', {
        ok: true,
        answer: data.answer,
      });
    } catch (error) {
      this.logger.error(error);
      socket.broadcast.to(data.roomName).emit('answer', {
        ok: false,
        error: 'Fail answer',
      });
    }
  }

  @SubscribeMessage('ice')
  async ice(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    data: { ice: any; roomName: string },
  ) {
    try {
      socket.broadcast.to(data.roomName).emit('ice', {
        ok: true,
        ice: data.ice,
      });
    } catch (error) {
      this.logger.error(error);
      socket.broadcast.to(data.roomName).emit('ice', {
        ok: false,
        error: 'Fail ice',
      });
    }
  }
}
