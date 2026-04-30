import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from './mailer/mailer.module';
import { RepositoriesModule } from './repositories/repositories.module';
import { FilesModule } from './files/files.module';
import { SysredditModule } from './Sysreditt/Sysreddit.module';
import { RecursosModule } from './recursoAuxiliar/recursos.module';
import { CursoEspacioModule } from './cursoEspacio/curso-espacio.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    MailerModule,
    RepositoriesModule,
    FilesModule,
    SysredditModule,
    RecursosModule,
    CursoEspacioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
