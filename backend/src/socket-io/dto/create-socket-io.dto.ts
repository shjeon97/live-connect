import { PickType } from '@nestjs/swagger';
import { SocketIo } from '../entity/socket-io.entity';

export class CreateSocketIoInput extends PickType(SocketIo, [
  'roomName',
  'userName',
  'clientId',
]) {}
