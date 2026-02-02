import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('IDFY Identity Provider API')
    .setDescription(
      'API complète pour un Identity Provider avec gestion des utilisateurs et des clients OAuth',
    )
    .setVersion('1.0.0')
    .addTag('Users', 'Gestion des utilisateurs et des comptes')
    .addTag('OAuth Clients', 'Gestion des applications clientes OAuth')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearer',
    )
    .setContact(
      'Support',
      'https://github.com/blaiseismael/idfy-nest',
      'support@idfy.local',
    )
    .setLicense('UNLICENSED', '')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: true,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
    },
    customCss: `
      .topbar { background-color: #1f2937; }
      .swagger-ui .topbar-wrapper { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      .swagger-ui .model-toggle:after { background: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2720%27 height=%2720%27 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23667eea%22 stroke-width=%222%22%3E%3Cpolyline points=%226 9 12 15 18 9%22%3E%3C/polyline%3E%3C/svg%3E"); }
    `,
    customSiteTitle: 'IDFY API Documentation',
  });

  await app.listen(process.env.PORT ?? 4000, () => {
    console.log(
      `🚀 Server is running on http://localhost:${process.env.PORT ?? 4000}`,
    );
    console.log(
      `📚 API docs available at http://localhost:${process.env.PORT ?? 4000}/api/docs`,
    );
  });
}
bootstrap();
