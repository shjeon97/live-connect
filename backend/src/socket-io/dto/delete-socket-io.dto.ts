import { PickType } from '@nestjs/swagger';
import { SocketIo } from '../entity/socket-io.entity';

export class DeleteSocketIoInput extends PickType(SocketIo, ['clientId']) {}
