import { ApiProperty } from '@nestjs/swagger';

export class CoreOutput {
  @ApiProperty({ example: '에러 내용', description: '에러 내용' })
  error?: string;
  @ApiProperty({ example: true, description: '성공/실패 여부' })
  ok: boolean;
}
