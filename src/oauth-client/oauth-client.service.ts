/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuthClient, ClientStatusEnum } from './entities/oauth-client.entity';
import {
  CreateOAuthClientDto,
  UpdateOAuthClientDto,
  UpdateClientStatusDto,
} from './dto';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OAuthClientService {
  private readonly logger = new Logger(OAuthClientService.name);

  constructor(
    @InjectRepository(OAuthClient)
    private oauthClientRepository: Repository<OAuthClient>,
  ) {}

  async create(
    createOAuthClientDto: CreateOAuthClientDto,
  ): Promise<OAuthClient> {
    const clientId = this.generateClientId();
    const clientSecret = this.generateClientSecret();

    const hashedSecret = await bcrypt.hash(clientSecret, 10);

    const oauthClient = this.oauthClientRepository.create({
      name: createOAuthClientDto.name,
      clientId,
      clientSecret: hashedSecret,
      redirectUri: createOAuthClientDto.redirectUri,
      status: ClientStatusEnum.ACTIVE,
    });

    const savedClient = await this.oauthClientRepository.save(oauthClient);
    this.logger.log(`OAuth client created: ${clientId}`, 'create');

    return savedClient;
  }

  async findAll(): Promise<OAuthClient[]> {
    this.logger.log('Retrieving all OAuth clients', 'findAll');
    return this.oauthClientRepository.find();
  }

  async findOne(id: string): Promise<OAuthClient> {
    const client = await this.oauthClientRepository.findOne({ where: { id } });

    if (!client) {
      this.logger.warn(`OAuth client not found: ${id}`, 'findOne');
      throw new NotFoundException(`OAuth client with ID "${id}" not found`);
    }

    return client;
  }

  async findByClientId(clientId: string): Promise<OAuthClient> {
    const client = await this.oauthClientRepository.findOne({
      where: { clientId },
    });

    if (!client) {
      this.logger.warn(
        `OAuth client not found by clientId: ${clientId}`,
        'findByClientId',
      );
      throw new NotFoundException(
        `OAuth client with clientId "${clientId}" not found`,
      );
    }

    return client;
  }

  async update(
    id: string,
    updateOAuthClientDto: UpdateOAuthClientDto,
  ): Promise<OAuthClient> {
    const client = await this.findOne(id);

    if (updateOAuthClientDto.name) {
      client.name = updateOAuthClientDto.name;
    }

    if (updateOAuthClientDto.redirectUri) {
      client.redirectUri = updateOAuthClientDto.redirectUri;
    }

    const updatedClient = await this.oauthClientRepository.save(client);
    this.logger.log(`OAuth client updated: ${id}`, 'update');

    return updatedClient;
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateClientStatusDto,
  ): Promise<OAuthClient> {
    const client = await this.findOne(id);

    client.status = updateStatusDto.status;

    const updatedClient = await this.oauthClientRepository.save(client);
    this.logger.log(
      `OAuth client status updated: ${id} -> ${updateStatusDto.status}`,
      'updateStatus',
    );

    return updatedClient;
  }

  async remove(id: string): Promise<void> {
    const client = await this.findOne(id);
    await this.oauthClientRepository.remove(client);
    this.logger.log(`OAuth client deleted: ${id}`, 'remove');
  }

  private generateClientId(): string {
    return `client_${crypto.randomBytes(16).toString('hex')}`;
  }

  private generateClientSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async verifyClientSecret(
    clientId: string,
    clientSecret: string,
  ): Promise<boolean> {
    const client = await this.findByClientId(clientId);
    return bcrypt.compare(clientSecret, client.clientSecret);
  }

  async isClientActive(id: string): Promise<boolean> {
    const client = await this.findOne(id);
    return client.status === ClientStatusEnum.ACTIVE;
  }
}
