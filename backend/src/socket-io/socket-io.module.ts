import { Module } from '@nestjs/common';
import { SocketIoGateway } from './socket-io.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocketIo } from './entity/socket-io.entity';
import { SocketIoService } from './socket-io.service';
import { SocketIoController } from './socket-io.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SocketIo])],
  providers: [SocketIoGateway, SocketIoService],
  exports: [SocketIoGateway],
  controllers: [SocketIoController],
})
export class SocketIoModule {}
