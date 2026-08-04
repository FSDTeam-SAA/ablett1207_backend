import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from './app/config';
import { AuthModule } from './app/module/auth/auth.module';
import { UserModule } from './app/module/user/user.module';
// import { DashboardModule } from './app/module/dashboard/dashboard.module';
import { ServiceModule } from './app/module/service/service.module';
import { FaqModule } from './app/module/faq/faq.module';
import { ProjectModule } from './app/module/project/project.module';
import { QuoteModule } from './app/module/quote/quote.module';
import { ChatModule } from './app/module/chat/chat.module';

import { BookingModule } from './app/module/booking/booking.module';
import { DashboardModule } from './app/module/dashboard/dashboard.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(config.mongoUri as string),
    AuthModule,
    UserModule,
    ServiceModule,
    FaqModule,
    ProjectModule,
    ChatModule,
    QuoteModule,
    BookingModule,
    DashboardModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
