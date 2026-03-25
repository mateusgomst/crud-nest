import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AddressesModule } from './addresses/addresses.module';
import { FilmesModule } from './filmes/filmes.module';
import { GenerosModule } from './generos/generos.module';
import { IngressosModule } from './ingressos/ingressos.module';
import { LanchesComboModule } from './lanches-combo/lanches-combo.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfilesModule } from './profiles/profiles.module';
import { SalasModule } from './salas/salas.module';
import { SessoesModule } from './sessoes/sessoes.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    GenerosModule,
    FilmesModule,
    SalasModule,
    SessoesModule,
    IngressosModule,
    LanchesComboModule,
    PedidosModule,
    ProfilesModule,
    UsersModule,
    AddressesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
