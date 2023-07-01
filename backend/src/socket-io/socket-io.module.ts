import { Module } from '@nestjs/common';
import { SocketIoGateway } from './socket-io.gateway';

@Module({
  imports: [],
  providers: [SocketIoGateway],
  exports: [SocketIoGateway],
})
export class SocketIoModule {}
