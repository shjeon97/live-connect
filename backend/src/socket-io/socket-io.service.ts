import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SocketIo } from './entity/socket-io.entity';
import { Repository } from 'typeorm';
import { CreateSocketIoInput } from './dto/create-socket-io.dto';
import { CoreOutput } from 'src/common/dto/output.dto';
import { DeleteSocketIoInput } from './dto/delete-socket-io.dto';

@Injectable()
export class SocketIoService {
  constructor(
    @InjectRepository(SocketIo)
    private readonly socketIo: Repository<SocketIo>,
  ) {}
  private readonly logger = new Logger(SocketIoService.name);

  async createSocketIo({
    roomName,
    userName,
    clientId,
  }: CreateSocketIoInput): Promise<CoreOutput> {
    try {
      const exist = await this.socketIo.findOne({
        where: { roomName, userName },
      });

      if (exist) {
        return {
          ok: false,
          error: 'This name is already in use. Please use a different name.',
        };
      }

      this.socketIo.save(
        this.socketIo.create({
          roomName,
          userName,
          clientId,
        }),
      );

      return {
        ok: true,
      };
    } catch (error) {
      this.logger.error(error);
      return {
        ok: false,
        error: 'failed to create socket io',
      };
    }
  }

  async deleteSocketIo({ clientId }: DeleteSocketIoInput): Promise<CoreOutput> {
    try {
      const exist = await this.socketIo.findOne({ where: { clientId } });
      console.log(exist);

      if (!exist) {
        return {
          ok: false,
          error: 'not found socket io',
        };
      }
      await this.socketIo.delete({ clientId: exist.clientId });

      return {
        ok: true,
      };
    } catch (error) {
      this.logger.error(error);
      return {
        ok: false,
        error: 'failed to delete socket io',
      };
    }
  }
}
