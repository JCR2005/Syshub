"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBlogDto = exports.UpdateThreadDto = exports.CreateCommentDto = exports.CreateThreadDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateThreadDto {
    titulo;
    contenido;
    categoria;
    tags;
}
exports.CreateThreadDto = CreateThreadDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '¿Cómo aprender NestJS?',
        minLength: 10,
        maxLength: 300,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", String)
], CreateThreadDto.prototype, "titulo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Estoy empezando con NestJS y quiero consejos...',
        minLength: 20,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(20),
    __metadata("design:type", String)
], CreateThreadDto.prototype, "contenido", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Backend',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateThreadDto.prototype, "categoria", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: ['nestjs', 'backend'],
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateThreadDto.prototype, "tags", void 0);
class CreateCommentDto {
    texto;
}
exports.CreateCommentDto = CreateCommentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '¡Excelente artículo!',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "texto", void 0);
class UpdateThreadDto {
    titulo;
    contenido;
    categoria;
    tags;
}
exports.UpdateThreadDto = UpdateThreadDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '¿Cómo aprender NestJS?',
        minLength: 10,
        maxLength: 300,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", String)
], UpdateThreadDto.prototype, "titulo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Estoy empezando con NestJS y quiero consejos...',
        minLength: 20,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(20),
    __metadata("design:type", String)
], UpdateThreadDto.prototype, "contenido", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Backend',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateThreadDto.prototype, "categoria", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: ['nestjs', 'backend'],
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateThreadDto.prototype, "tags", void 0);
class CreateBlogDto {
    titulo;
    contenido;
    extracto;
    categoria;
    tags;
    readTime;
}
exports.CreateBlogDto = CreateBlogDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Mi experiencia con NestJS',
        minLength: 10,
        maxLength: 300,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(300),
    __metadata("design:type", String)
], CreateBlogDto.prototype, "titulo", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(100),
    __metadata("design:type", String)
], CreateBlogDto.prototype, "contenido", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(20),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateBlogDto.prototype, "extracto", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBlogDto.prototype, "categoria", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateBlogDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateBlogDto.prototype, "readTime", void 0);
//# sourceMappingURL=Sysreddit.dto.js.map