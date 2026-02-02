/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
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
import { AppLogger } from '../common/logger';

@Injectable()
export class OAuthClientService {
  private readonly logger = new AppLogger(OAuthClientService.name);

  constructor(
    @InjectRepository(OAuthClient)
    private oauthClientRepository: Repository<OAuthClient>,
  ) {}

  async create(
    createOAuthClientDto: CreateOAuthClientDto,
  ): Promise<OAuthClient> {
    const startTime = Date.now();
    this.logger.info('🚀 Creating new OAuth client', {
      name: createOAuthClientDto.name,
    });

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
    const duration = Date.now() - startTime;

    this.logger.logDataOperation(
      'CREATE',
      'OAuthClient',
      savedClient.id,
      duration,
      {
        clientId: savedClient.clientId,
        name: savedClient.name,
        status: savedClient.status,
      },
    );

    return savedClient;
  }

  async findAll(): Promise<OAuthClient[]> {
    const startTime = Date.now();
    this.logger.info('📋 Retrieving all OAuth clients');

    const clients = await this.oauthClientRepository.find();
    const duration = Date.now() - startTime;

    this.logger.logDatabase('SELECT', 'oauth_clients', duration, {
      total: clients.length,
    });

    return clients;
  }

  async findOne(id: string): Promise<OAuthClient> {
    const startTime = Date.now();
    this.logger.info('🔍 Finding OAuth client', { id });

    const client = await this.oauthClientRepository.findOne({ where: { id } });
    const duration = Date.now() - startTime;

    if (!client) {
      this.logger.logWarningDetails('OAuth client not found', 'HIGH', { id });
      throw new NotFoundException(`OAuth client with ID "${id}" not found`);
    }

    this.logger.logDatabase('SELECT', 'oauth_clients', duration, {
      found: true,
    });
    return client;
  }

  async findByClientId(clientId: string): Promise<OAuthClient> {
    const startTime = Date.now();
    this.logger.info('🔍 Finding OAuth client by clientId', { clientId });

    const client = await this.oauthClientRepository.findOne({
      where: { clientId },
    });
    const duration = Date.now() - startTime;

    if (!client) {
      this.logger.logWarningDetails(
        'OAuth client not found by clientId',
        'HIGH',
        { clientId },
      );
      throw new NotFoundException(
        `OAuth client with clientId "${clientId}" not found`,
      );
    }

    this.logger.logDatabase('SELECT', 'oauth_clients', duration, {
      found: true,
    });
    return client;
  }

  async update(
    id: string,
    updateOAuthClientDto: UpdateOAuthClientDto,
  ): Promise<OAuthClient> {
    const startTime = Date.now();
    this.logger.info('✏️ Updating OAuth client', {
      id,
      updates: Object.keys(updateOAuthClientDto),
    });

    const client = await this.findOne(id);

    if (updateOAuthClientDto.name) {
      client.name = updateOAuthClientDto.name;
    }

    if (updateOAuthClientDto.redirectUri) {
      client.redirectUri = updateOAuthClientDto.redirectUri;
    }

    const updatedClient = await this.oauthClientRepository.save(client);
    const duration = Date.now() - startTime;

    this.logger.logDataOperation('UPDATE', 'OAuthClient', id, duration, {
      name: updatedClient.name,
      redirectUri: updatedClient.redirectUri,
    });

    return updatedClient;
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateClientStatusDto,
  ): Promise<OAuthClient> {
    const startTime = Date.now();
    this.logger.info('🔄 Updating OAuth client status', {
      id,
      newStatus: updateStatusDto.status,
    });

    const client = await this.findOne(id);
    const oldStatus = client.status;

    client.status = updateStatusDto.status;

    const updatedClient = await this.oauthClientRepository.save(client);
    const duration = Date.now() - startTime;

    this.logger.logDataOperation('UPDATE', 'OAuthClient Status', id, duration, {
      from: oldStatus,
      to: updateStatusDto.status,
    });

    return updatedClient;
  }

  async remove(id: string): Promise<void> {
    const startTime = Date.now();
    this.logger.info('🗑️ Deleting OAuth client', { id });

    const client = await this.findOne(id);
    await this.oauthClientRepository.remove(client);
    const duration = Date.now() - startTime;

    this.logger.logDataOperation('DELETE', 'OAuthClient', id, duration, {
      name: client.name,
      clientId: client.clientId,
    });
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
    const startTime = Date.now();
    this.logger.info('🔐 Verifying client secret', { clientId });

    const client = await this.findByClientId(clientId);
    const isValid = await bcrypt.compare(clientSecret, client.clientSecret);
    const duration = Date.now() - startTime;

    if (!isValid) {
      this.logger.logWarningDetails('Invalid client secret attempt', 'MEDIUM', {
        clientId,
        duration: `${duration}ms`,
      });
    } else {
      this.logger.success('✅ Client secret verified', {
        clientId,
        duration: `${duration}ms`,
      });
    }

    return isValid;
  }

  async isClientActive(id: string): Promise<boolean> {
    const client = await this.findOne(id);
    const isActive = client.status === ClientStatusEnum.ACTIVE;

    this.logger.info('🔍 Checking client status', {
      id,
      status: client.status,
      isActive,
    });

    return isActive;
  }
}
