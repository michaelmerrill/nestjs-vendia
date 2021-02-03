import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from '@vendia/serverless-express';
import { Context } from 'aws-lambda';
import express from 'express';
import { RequestListener } from 'http';

import { AppModule } from './app.module';

let cachedApp: RequestListener;

async function bootstrap() {
  if (!cachedApp) {
    const expressApp = express();
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );

    nestApp.enableCors();

    await nestApp.init();

    cachedApp = expressApp;
  }

  return cachedApp;
}

export const handler = async (event: any, context: Context, callback: any) => {
  const app = await bootstrap();
  const { handler } = serverlessExpress({ app });
  handler(event, context, callback);
};
