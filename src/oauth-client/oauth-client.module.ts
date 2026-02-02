import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OAuthClientService } from './oauth-client.service';
import { OAuthClientController } from './oauth-client.controller';
import { OAuthClient } from './entities/oauth-client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OAuthClient])],
  controllers: [OAuthClientController],
  providers: [OAuthClientService],
  exports: [OAuthClientService],
})
export class OAuthClientModule {}
