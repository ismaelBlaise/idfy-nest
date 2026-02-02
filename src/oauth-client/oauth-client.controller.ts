import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OAuthClientService } from './oauth-client.service';
import {
  CreateOAuthClientDto,
  UpdateOAuthClientDto,
  UpdateClientStatusDto,
  OAuthClientResponseDto,
  OAuthClientSecretDto,
} from './dto';
import { plainToClass } from 'class-transformer';

@Controller('oauth-clients')
export class OAuthClientController {
  constructor(private readonly oauthClientService: OAuthClientService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createOAuthClientDto: CreateOAuthClientDto,
  ): Promise<OAuthClientSecretDto> {
    const client = await this.oauthClientService.create(createOAuthClientDto);

    return {
      clientId: client.clientId,
      clientSecret: client.clientSecret,
      status: client.status,
    };
  }

  @Get()
  async findAll(): Promise<OAuthClientResponseDto[]> {
    const clients = await this.oauthClientService.findAll();
    return plainToClass(OAuthClientResponseDto, clients, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<OAuthClientResponseDto> {
    const client = await this.oauthClientService.findOne(id);
    return plainToClass(OAuthClientResponseDto, client, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOAuthClientDto: UpdateOAuthClientDto,
  ): Promise<OAuthClientResponseDto> {
    const client = await this.oauthClientService.update(
      id,
      updateOAuthClientDto,
    );
    return plainToClass(OAuthClientResponseDto, client, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateClientStatusDto,
  ): Promise<OAuthClientResponseDto> {
    const client = await this.oauthClientService.updateStatus(
      id,
      updateStatusDto,
    );
    return plainToClass(OAuthClientResponseDto, client, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.oauthClientService.remove(id);
  }
}
