import { Body, Controller, Delete, Post } from '@nestjs/common';
import { SocketIoService } from './socket-io.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CoreOutput } from 'src/common/dto/output.dto';
import { CreateSocketIoInput } from './dto/create-socket-io.dto';
import { DeleteSocketIoInput } from './dto/delete-socket-io.dto';

@Controller('socket-io')
export class SocketIoController {
  constructor(private readonly socketIoService: SocketIoService) {}

  @ApiOperation({ summary: 'Create socket io' })
  @ApiResponse({ type: CoreOutput })
  @Post()
  async createSocketIo(
    @Body() createSocketIoInput: CreateSocketIoInput,
  ): Promise<CoreOutput> {
    return this.socketIoService.createSocketIo(createSocketIoInput);
  }

  @ApiOperation({ summary: 'Delete socket io' })
  @ApiResponse({ type: CoreOutput })
  @Delete()
  async deleteSocketIo(
    @Body() deleteSocketIoInput: DeleteSocketIoInput,
  ): Promise<CoreOutput> {
    return this.socketIoService.deleteSocketIo(deleteSocketIoInput);
  }
}
