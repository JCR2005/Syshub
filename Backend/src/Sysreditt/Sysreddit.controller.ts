import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SysredditService } from './Sysreddit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

type AuthReq = Request & {
  user?: { sub?: number | string; id?: number | string; roles?: string[] };
};

const blogCoverUploadPath = join(process.cwd(), 'uploads', 'blog-covers');
const ensureDir = (p: string) => {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
};

function uid(req: AuthReq): number {
  return Number(req.user?.sub ?? req.user?.id);
}

function isAdmin(req: AuthReq): boolean {
  const roles = (req.user as any)?.roles ?? [];
  return roles.some((r: string) => /admin|mod/i.test(r));
}

function isAuxiliar(req: AuthReq): boolean {
  const roles = (req.user as any)?.roles ?? [];
  return roles.some((r: string) => /aux|admin|mod/i.test(r));
}

function canPublishBlog(req: AuthReq): boolean {
  if (isAuxiliar(req)) return true;

  const roles = ((req.user as any)?.roles ?? []).map((r: string) =>
    String(r ?? '').toLowerCase(),
  );
  const isStudent = roles.some((r: string) =>
    /comun|estudiante|student/.test(r),
  );
  const hasEditorialPermission = roles.some((r: string) =>
    /publicador|editor|autor[_-]?blog|permiso[_-]?blog|blog[_-]?writer/.test(r),
  );

  return isStudent && hasEditorialPermission;
}

@Controller('sysreddit')
export class SysredditController {
  constructor(private readonly service: SysredditService) {}

  // ─── Catálogos ────────────────────────────────────────────────────────────────

  /** GET /sysreddit/categorias
   *  Devuelve las categorías fijas del foro con conteo de hilos */
  @Get('categorias')
  @UseGuards(JwtAuthGuard)
  async getCategorias() {
    const categorias = await this.service.getCategorias();
    return { ok: true, categorias };
  }

  /** GET /sysreddit/tipos
   *  Devuelve los tipos de hilo: Pregunta, Discusión, Tutorial, Anuncio */
  @Get('tipos')
  @UseGuards(JwtAuthGuard)
  async getTipos() {
    const tipos = await this.service.getTipos();
    return { ok: true, tipos };
  }

  /** GET /sysreddit/stats */
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats() {
    const stats = await this.service.getStats();
    return { ok: true, stats };
  }

  // ─── HILOS ────────────────────────────────────────────────────────────────────

  /** GET /sysreddit/hilos
   *  Query: categoriaId?, search?, sortBy=hot|new|top, page=1 */
  @Get('hilos')
  @UseGuards(JwtAuthGuard)
  async getHilos(
    @Req() req: AuthReq,
    @Query('categoriaId') categoriaId?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'hot' | 'new' | 'top',
    @Query('page') page?: string,
  ) {
    const result = await this.service.getForumHilos({
      categoriaId: categoriaId ? Number(categoriaId) : undefined,
      search,
      sortBy,
      page: page ? Number(page) : 1,
      userId: uid(req),
    });
    return { ok: true, ...result };
  }

  /** GET /sysreddit/hilos/:id */
  @Get('hilos/:id')
  @UseGuards(JwtAuthGuard)
  async getHilo(@Param('id') id: string, @Req() req: AuthReq) {
    const hilo = await this.service.getHiloById(Number(id), uid(req));
    return { ok: true, hilo };
  }

  // ─── BLOGS / ARTÍCULOS ───────────────────────────────────────────────────────

  /** GET /sysreddit/blogs
   *  Query: categoriaId?, search?, sortBy=hot|new|top, page=1 */
  @Get('blogs')
  @UseGuards(JwtAuthGuard)
  async getBlogs(
    @Req() req: AuthReq,
    @Query('categoriaId') categoriaId?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'hot' | 'new' | 'top',
    @Query('page') page?: string,
    @Query('kind') kind?: 'blog' | 'articulo' | 'all',
  ) {
    const result = await this.service.getBlogs({
      categoriaId: categoriaId ? Number(categoriaId) : undefined,
      search,
      sortBy,
      page: page ? Number(page) : 1,
      userId: uid(req),
      kind: kind ?? 'blog',
    });
    return { ok: true, ...result };
  }

  /** GET /sysreddit/articulos
   *  Query: categoriaId?, search?, sortBy=hot|new|top, page=1 */
  @Get('articulos')
  @UseGuards(JwtAuthGuard)
  async getArticulos(
    @Req() req: AuthReq,
    @Query('categoriaId') categoriaId?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'hot' | 'new' | 'top',
    @Query('page') page?: string,
  ) {
    const result = await this.service.getBlogs({
      categoriaId: categoriaId ? Number(categoriaId) : undefined,
      search,
      sortBy,
      page: page ? Number(page) : 1,
      userId: uid(req),
      kind: 'articulo',
    });
    return { ok: true, ...result };
  }

  /** GET /sysreddit/blogs/:id */
  @Get('blogs/:id')
  @UseGuards(JwtAuthGuard)
  async getBlog(
    @Param('id') id: string,
    @Req() req: AuthReq,
    @Query('kind') kind?: 'blog' | 'articulo',
  ) {
    const blog = await this.service.getBlogById(Number(id), uid(req), kind);
    return { ok: true, blog };
  }

  /** GET /sysreddit/articulos/:id */
  @Get('articulos/:id')
  @UseGuards(JwtAuthGuard)
  async getArticulo(@Param('id') id: string, @Req() req: AuthReq) {
    const articulo = await this.service.getBlogById(
      Number(id),
      uid(req),
      'articulo',
    );
    return { ok: true, articulo };
  }

  /** POST /sysreddit/blogs
   *  Body: { titulo, contenido, categoriaId, tipoId?, formato? } */
  @Post('blogs')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createBlog(
    @Req() req: AuthReq,
    @Body()
    body: {
      titulo: string;
      contenido: string;
      categoriaId: number;
      tipoId?: number;
      formato?: 'blog' | 'articulo';
      coverImageUrl?: string;
    },
  ) {
    if (!canPublishBlog(req)) {
      throw new ForbiddenException(
        'Solo auxiliares/admin/mod o estudiantes con permiso editorial pueden publicar blogs/artículos.',
      );
    }

    const blog = await this.service.createBlog(uid(req), body);
    return { ok: true, blog };
  }

  /** POST /sysreddit/articulos
   *  Body: { titulo, contenido, categoriaId, tipoId?, coverImageUrl? } */
  @Post('articulos')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createArticulo(
    @Req() req: AuthReq,
    @Body()
    body: {
      titulo: string;
      contenido: string;
      categoriaId: number;
      tipoId?: number;
      coverImageUrl?: string;
    },
  ) {
    if (!canPublishBlog(req)) {
      throw new ForbiddenException(
        'Solo auxiliares/admin/mod o estudiantes con permiso editorial pueden publicar artículos.',
      );
    }

    const articulo = await this.service.createBlog(uid(req), {
      ...body,
      formato: 'articulo',
    });
    return { ok: true, articulo };
  }

  /** POST /sysreddit/blogs/cover  — multipart form-data: file */
  @Post('blogs/cover')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          ensureDir(blogCoverUploadPath);
          cb(null, blogCoverUploadPath);
        },
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `blog-cover-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 3 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
        const ext = extname(file.originalname).toLowerCase();
        if (!allowed.includes(ext)) {
          return cb(new Error('Formato de imagen no permitido'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadBlogCover(@UploadedFile() file?: Express.Multer.File) {
    const url = file ? `/uploads/blog-covers/${file.filename}` : null;
    return { ok: true, url };
  }

  /** POST /sysreddit/blogs/:id/votar  — body: { isUp: true|false } */
  @Post('blogs/:id/votar')
  @UseGuards(JwtAuthGuard)
  async votarBlog(
    @Param('id') id: string,
    @Req() req: AuthReq,
    @Body() body: { isUp: boolean },
    @Query('kind') kind?: 'blog' | 'articulo',
  ) {
    const result = await this.service.votarBlog(
      uid(req),
      Number(id),
      body.isUp,
      kind,
    );
    return { ok: true, ...result };
  }

  /** POST /sysreddit/articulos/:id/votar  — body: { isUp: true|false } */
  @Post('articulos/:id/votar')
  @UseGuards(JwtAuthGuard)
  async votarArticulo(
    @Param('id') id: string,
    @Req() req: AuthReq,
    @Body() body: { isUp: boolean },
  ) {
    const result = await this.service.votarBlog(
      uid(req),
      Number(id),
      body.isUp,
      'articulo',
    );
    return { ok: true, ...result };
  }

  /** GET /sysreddit/blogs/:id/comentarios */
  @Get('blogs/:id/comentarios')
  @UseGuards(JwtAuthGuard)
  async getBlogComentarios(
    @Param('id') id: string,
    @Req() req: AuthReq,
    @Query('kind') kind?: 'blog' | 'articulo',
  ) {
    const comentarios = await this.service.getBlogComentarios(
      Number(id),
      uid(req),
      kind,
    );
    return { ok: true, comentarios };
  }

  /** GET /sysreddit/articulos/:id/comentarios */
  @Get('articulos/:id/comentarios')
  @UseGuards(JwtAuthGuard)
  async getArticuloComentarios(@Param('id') id: string, @Req() req: AuthReq) {
    const comentarios = await this.service.getBlogComentarios(
      Number(id),
      uid(req),
      'articulo',
    );
    return { ok: true, comentarios };
  }

  /** POST /sysreddit/blogs/:id/comentarios  — body: { texto, parentId? } */
  @Post('blogs/:id/comentarios')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createBlogComentario(
    @Param('id') id: string,
    @Req() req: AuthReq,
    @Body() body: { texto: string; parentId?: number },
    @Query('kind') kind?: 'blog' | 'articulo',
  ) {
    const comentario = await this.service.createBlogComentario(
      uid(req),
      Number(id),
      body.texto,
      body.parentId,
      kind,
    );
    return { ok: true, comentario };
  }

  /** POST /sysreddit/articulos/:id/comentarios  — body: { texto } */
  @Post('articulos/:id/comentarios')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createArticuloComentario(
    @Param('id') id: string,
    @Req() req: AuthReq,
    @Body() body: { texto: string },
  ) {
    const comentario = await this.service.createBlogComentario(
      uid(req),
      Number(id),
      body.texto,
      undefined,
      'articulo',
    );
    return { ok: true, comentario };
  }

  /** POST /sysreddit/hilos
   *  Body: { titulo, contenido, categoriaId, tipoId? } */
  @Post('hilos')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createHilo(
    @Req() req: AuthReq,
    @Body()
    body: {
      titulo: string;
      contenido: string;
      categoriaId: number;
      tipoId?: number;
    },
  ) {
    const hilo = await this.service.createHilo(uid(req), body);
    return { ok: true, hilo };
  }

  /** PATCH /sysreddit/hilos/:id */
  @Patch('hilos/:id')
  @UseGuards(JwtAuthGuard)
  async updateHilo(
    @Param('id') id: string,
    @Req() req: AuthReq,
    @Body()
    body: {
      titulo?: string;
      contenido?: string;
      categoriaId?: number;
      tipoId?: number;
      coverImageUrl?: string;
    },
  ) {
    const hilo = await this.service.updateHilo(
      uid(req),
      Number(id),
      body,
      isAdmin(req),
    );
    return { ok: true, hilo };
  }

  /** PATCH /sysreddit/blogs/:id */
  @Patch('blogs/:id')
  @UseGuards(JwtAuthGuard)
  async updateBlog(
    @Param('id') id: string,
    @Req() req: AuthReq,
    @Query('kind') kind: 'blog' | 'articulo' = 'blog',
    @Body()
    body: {
      titulo?: string;
      contenido?: string;
      categoriaId?: number;
      tipoId?: number;
      coverImageUrl?: string;
    },
  ) {
    const blog = await this.service.updateBlog(
      uid(req),
      Number(id),
      body,
      kind,
      isAdmin(req),
    );
    return { ok: true, blog };
  }

  /** PATCH /sysreddit/articulos/:id */
  @Patch('articulos/:id')
  @UseGuards(JwtAuthGuard)
  async updateArticulo(
    @Param('id') id: string,
    @Req() req: AuthReq,
    @Body()
    body: {
      titulo?: string;
      contenido?: string;
      categoriaId?: number;
      tipoId?: number;
      coverImageUrl?: string;
    },
  ) {
    const articulo = await this.service.updateBlog(
      uid(req),
      Number(id),
      body,
      'articulo',
      isAdmin(req),
    );
    return { ok: true, articulo };
  }

  /** DELETE /sysreddit/hilos/:id */
  @Delete('hilos/:id')
  @UseGuards(JwtAuthGuard)
  async deleteHilo(@Param('id') id: string, @Req() req: AuthReq) {
    return this.service.deleteHilo(uid(req), Number(id), isAdmin(req));
  }

  // ── Moderación (solo auxiliares/admins) ───────────────────────────────────────

  /** PATCH /sysreddit/hilos/:id/pin  — body: { isPinned: true|false } */
  @Patch('hilos/:id/pin')
  @UseGuards(JwtAuthGuard)
  async pinHilo(@Param('id') id: string, @Body() body: { isPinned: boolean }) {
    const result = await this.service.pinHilo(Number(id), body.isPinned);
    return { ok: true, ...result };
  }

  /** PATCH /sysreddit/hilos/:id/feature */
  @Patch('hilos/:id/feature')
  @UseGuards(JwtAuthGuard)
  async featureHilo(
    @Param('id') id: string,
    @Body() body: { isFeatured: boolean },
  ) {
    const result = await this.service.featureHilo(Number(id), body.isFeatured);
    return { ok: true, ...result };
  }

  /** PATCH /sysreddit/hilos/:id/report */
  @Patch('hilos/:id/report')
  @UseGuards(JwtAuthGuard)
  async reportHilo(
    @Param('id') id: string,
    @Body() body: { reportado: boolean },
  ) {
    const result = await this.service.reportHilo(Number(id), body.reportado);
    return { ok: true, ...result };
  }

  // ── Votar hilo ────────────────────────────────────────────────────────────────

  /** POST /sysreddit/hilos/:id/votar  — body: { isUp: true|false } */
  @Post('hilos/:id/votar')
  @UseGuards(JwtAuthGuard)
  async votar(
    @Param('id') id: string,
    @Req() req: AuthReq,
    @Body() body: { isUp: boolean },
  ) {
    const result = await this.service.votar(uid(req), Number(id), body.isUp);
    return { ok: true, ...result };
  }

  // ─── COMENTARIOS ─────────────────────────────────────────────────────────────

  /** GET /sysreddit/hilos/:id/comentarios */
  @Get('hilos/:id/comentarios')
  @UseGuards(JwtAuthGuard)
  async getComentarios(@Param('id') id: string, @Req() req: AuthReq) {
    const comentarios = await this.service.getComentarios(Number(id), uid(req));
    return { ok: true, comentarios };
  }

  /** POST /sysreddit/hilos/:id/comentarios  — body: { texto, parentId? } */
  @Post('hilos/:id/comentarios')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createComentario(
    @Param('id') id: string,
    @Req() req: AuthReq,
    @Body() body: { texto: string; parentId?: number },
  ) {
    const comentario = await this.service.createComentario(
      uid(req),
      Number(id),
      body.texto,
      body.parentId,
    );
    return { ok: true, comentario };
  }

  /** DELETE /sysreddit/comentarios/:id */
  @Delete('comentarios/:id')
  @UseGuards(JwtAuthGuard)
  async deleteComentario(@Param('id') id: string, @Req() req: AuthReq) {
    return this.service.deleteComentario(uid(req), Number(id), isAdmin(req));
  }

  /** POST /sysreddit/comentarios/:id/votar */
  @Post('comentarios/:id/votar')
  @UseGuards(JwtAuthGuard)
  async votarComentario(
    @Param('id') id: string,
    @Req() req: AuthReq,
    @Body() body: { isUp: boolean },
  ) {
    const result = await this.service.votarComentario(
      uid(req),
      Number(id),
      body.isUp,
    );
    return { ok: true, ...result };
  }

  // ─── ADMIN — Categorías del foro ─────────────────────────────────────────────

  /** POST /sysreddit/admin/categorias  — body: { categoria: string } */
  @Post('admin/categorias')
  @UseGuards(JwtAuthGuard)
  async createCategoria(@Body() body: { categoria: string }) {
    const result = await this.service.createCategoria(body.categoria);
    return { ok: true, categoria: result };
  }

  /** DELETE /sysreddit/admin/categorias/:id */
  @Delete('admin/categorias/:id')
  @UseGuards(JwtAuthGuard)
  async deleteCategoria(@Param('id') id: string) {
    return this.service.deleteCategoria(Number(id));
  }

  // ─── ADMIN — Tipos de hilo ────────────────────────────────────────────────────

  /** POST /sysreddit/admin/tipos  — body: { tipo: string } */
  @Post('admin/tipos')
  @UseGuards(JwtAuthGuard)
  async createTipo(@Body() body: { tipo: string }) {
    const result = await this.service.createTipo(body.tipo);
    return { ok: true, tipo: result };
  }

  /** DELETE /sysreddit/admin/tipos/:id */
  @Delete('admin/tipos/:id')
  @UseGuards(JwtAuthGuard)
  async deleteTipo(@Param('id') id: string) {
    return this.service.deleteTipo(Number(id));
  }
}
