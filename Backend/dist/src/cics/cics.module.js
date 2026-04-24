"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CicsModule = void 0;
const common_1 = require("@nestjs/common");
const cics_controller_1 = require("./cics.controller");
const cics_service_1 = require("./cics.service");
let CicsModule = class CicsModule {
};
exports.CicsModule = CicsModule;
exports.CicsModule = CicsModule = __decorate([
    (0, common_1.Module)({
        controllers: [cics_controller_1.CicsController],
        providers: [cics_service_1.CicsService],
        exports: [cics_service_1.CicsService],
    })
], CicsModule);
//# sourceMappingURL=cics.module.js.map