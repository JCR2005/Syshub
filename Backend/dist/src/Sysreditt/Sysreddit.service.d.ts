import { PrismaService } from '../prisma/prisma.service';
export declare class SysredditService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private sanitizeContent;
    private readonly blogTypeRegex;
    getCategorias(): Promise<any>;
    getTipos(): Promise<any>;
    private isBlogTypeName;
    private normalizeTypeText;
    private isArticleTypeName;
    private isBlogFormatTypeName;
    private ensureTipoByName;
    private getBlogTypeIds;
    private assertBlogHilo;
    getHilos(filters: {
        categoriaId?: number;
        search?: string;
        sortBy?: 'hot' | 'new' | 'top';
        page?: number;
        limit?: number;
        userId?: number;
        tipoIds?: number[];
        excludeTipoIds?: number[];
    }): Promise<{
        hilos: any;
        total: any;
        page: number;
        pages: number;
    }>;
    getForumHilos(filters: {
        categoriaId?: number;
        search?: string;
        sortBy?: 'hot' | 'new' | 'top';
        page?: number;
        limit?: number;
        userId?: number;
    }): Promise<{
        hilos: any;
        total: any;
        page: number;
        pages: number;
    }>;
    getHiloById(id: number, userId?: number): Promise<{
        id: any;
        titulo: any;
        contenido: any;
        categoria: any;
        categoriaId: any;
        tipo: any;
        tipoId: any;
        author: any;
        authorId: any;
        coverImageUrl: any;
        role: string;
        upvotes: any;
        commentCount: any;
        timeAgo: string;
        createdAt: any;
        hasUpvoted: boolean;
        hasDownvoted: boolean;
        isFeatured: any;
        isPinned: any;
        hasReports: any;
        comments: any;
    }>;
    private normalizeKind;
    private formatEditorialEntry;
    private formatEditorialComment;
    getBlogs(filters: {
        categoriaId?: number;
        search?: string;
        sortBy?: 'hot' | 'new' | 'top';
        page?: number;
        limit?: number;
        userId?: number;
        kind?: 'blog' | 'articulo' | 'all';
    }): Promise<{
        hilos: any[];
        total: number;
        page: number;
        pages: number;
    }>;
    getBlogById(id: number, userId?: number, kind?: 'blog' | 'articulo'): Promise<{
        id: any;
        kind: "blog" | "articulo";
        titulo: any;
        contenido: any;
        coverImageUrl: any;
        categoria: any;
        categoriaId: any;
        tipo: any;
        tipoId: any;
        author: any;
        authorId: any;
        role: string;
        upvotes: any;
        commentCount: any;
        timeAgo: string;
        createdAt: any;
        hasUpvoted: boolean;
        hasDownvoted: boolean;
        comments: any;
    }>;
    createBlog(autorId: number, data: {
        titulo: string;
        contenido: string;
        categoriaId: number;
        tipoId?: number;
        formato?: 'blog' | 'articulo';
        coverImageUrl?: string;
    }): Promise<{
        id: any;
        kind: "blog" | "articulo";
        titulo: any;
        contenido: any;
        coverImageUrl: any;
        categoria: any;
        categoriaId: any;
        tipo: any;
        tipoId: any;
        author: any;
        authorId: any;
        role: string;
        upvotes: any;
        commentCount: any;
        timeAgo: string;
        createdAt: any;
        hasUpvoted: boolean;
        hasDownvoted: boolean;
        comments: any;
    }>;
    getBlogComentarios(blogId: number, userId?: number, kind?: 'blog' | 'articulo'): Promise<any>;
    createBlogComentario(autorId: number, blogId: number, texto: string, _parentId?: number, kind?: 'blog' | 'articulo'): Promise<{
        id: any;
        author: any;
        authorId: any;
        role: string;
        text: any;
        upvotes: number;
        hasUpvoted: boolean;
        hasDownvoted: boolean;
        timeAgo: string;
        createdAt: any;
        parentId: null;
        replies: never[];
    }>;
    votarBlog(userId: number, blogId: number, isUp: boolean, kind?: 'blog' | 'articulo'): Promise<{
        id: number;
        upvotes: number;
        hasUpvoted: boolean;
        hasDownvoted: boolean;
        action: string;
    }>;
    createHilo(autorId: number, data: {
        titulo: string;
        contenido: string;
        categoriaId: number;
        tipoId?: number;
        coverImageUrl?: string;
    }): Promise<{
        id: any;
        titulo: any;
        contenido: any;
        categoria: any;
        categoriaId: any;
        tipo: any;
        tipoId: any;
        author: any;
        authorId: any;
        coverImageUrl: any;
        role: string;
        upvotes: any;
        commentCount: any;
        timeAgo: string;
        createdAt: any;
        hasUpvoted: boolean;
        hasDownvoted: boolean;
        isFeatured: any;
        isPinned: any;
        hasReports: any;
        comments: any;
    }>;
    updateHilo(userId: number, hiloId: number, data: {
        titulo?: string;
        contenido?: string;
        categoriaId?: number;
        tipoId?: number;
        coverImageUrl?: string;
    }, isAdmin?: boolean): Promise<any>;
    updateBlog(userId: number, blogId: number, data: {
        titulo?: string;
        contenido?: string;
        categoriaId?: number;
        tipoId?: number;
        coverImageUrl?: string;
    }, kind?: 'blog' | 'articulo', isAdmin?: boolean): Promise<{
        id: any;
        kind: "blog" | "articulo";
        titulo: any;
        contenido: any;
        coverImageUrl: any;
        categoria: any;
        categoriaId: any;
        tipo: any;
        tipoId: any;
        author: any;
        authorId: any;
        role: string;
        upvotes: any;
        commentCount: any;
        timeAgo: string;
        createdAt: any;
        hasUpvoted: boolean;
        hasDownvoted: boolean;
        comments: any;
    }>;
    deleteHilo(userId: number, hiloId: number, isAdmin?: boolean): Promise<{
        ok: boolean;
    }>;
    pinHilo(hiloId: number, isPinned: boolean): Promise<any>;
    featureHilo(hiloId: number, isFeatured: boolean): Promise<any>;
    reportHilo(hiloId: number, reportado: boolean): Promise<any>;
    votar(userId: number, hiloId: number, isUp: boolean): Promise<{
        id: number;
        upvotes: number;
        hasUpvoted: boolean;
        hasDownvoted: boolean;
        action: string;
    }>;
    getComentarios(hiloId: number, userId?: number): Promise<any>;
    createComentario(autorId: number, hiloId: number, texto: string, parentId?: number): Promise<{
        id: any;
        author: any;
        authorId: any;
        role: string;
        text: any;
        upvotes: any;
        hasUpvoted: boolean;
        hasDownvoted: boolean;
        timeAgo: string;
        createdAt: any;
        parentId: any;
        replies: any;
    }>;
    deleteComentario(userId: number, comentarioId: number, isAdmin?: boolean): Promise<{
        ok: boolean;
    }>;
    votarComentario(userId: number, comentarioId: number, isUp: boolean): Promise<any>;
    getStats(): Promise<{
        hilos: any;
        comentarios: any;
        categorias: any;
    }>;
    private resolveRole;
    private formatHilo;
    private formatComentario;
    private timeAgo;
    createCategoria(nombre: string): Promise<{
        id: any;
        nombre: any;
    }>;
    deleteCategoria(id: number): Promise<{
        ok: boolean;
    }>;
    createTipo(nombre: string): Promise<{
        id: any;
        nombre: any;
    }>;
    deleteTipo(id: number): Promise<{
        ok: boolean;
    }>;
}
