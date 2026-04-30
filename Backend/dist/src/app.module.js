"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const mailer_module_1 = require("./mailer/mailer.module");
const repositories_module_1 = require("./repositories/repositories.module");
const files_module_1 = require("./files/files.module");
const Sysreddit_module_1 = require("./Sysreditt/Sysreddit.module");
const recursos_module_1 = require("./recursoAuxiliar/recursos.module");
const curso_espacio_module_1 = require("./cursoEspacio/curso-espacio.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            mailer_module_1.MailerModule,
            repositories_module_1.RepositoriesModule,
            files_module_1.FilesModule,
            Sysreddit_module_1.SysredditModule,
            recursos_module_1.RecursosModule,
            curso_espacio_module_1.CursoEspacioModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map