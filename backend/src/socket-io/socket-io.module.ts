import { Module } from '@nestjs/common';
import { SocketIoGateway } from './socket-io.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocketIo } from './entity/socket-io.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SocketIo])],
  providers: [SocketIoGateway],
  exports: [SocketIoGateway],
})
export class SocketIoModule {}
