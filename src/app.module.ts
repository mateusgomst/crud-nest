import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AddressesModule } from './addresses/addresses.module';
import { AuthModule } from './auth/auth.module';
import { GenresModule } from './genres/genres.module';
import { MoviesModule } from './movies/movies.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfilesModule } from './profiles/profiles.module';
import { RoomsModule } from './rooms/rooms.module';
import { SessionsModule } from './sessions/sessions.module';
import { SnackCombosModule } from './snack-combos/snack-combos.module';
import { TicketsModule } from './tickets/tickets.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    GenresModule,
    MoviesModule,
    RoomsModule,
    SessionsModule,
    TicketsModule,
    SnackCombosModule,
    OrdersModule,
    ProfilesModule,
    UsersModule,
    AddressesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
