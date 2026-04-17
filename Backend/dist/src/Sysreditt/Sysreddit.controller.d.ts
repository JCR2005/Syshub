import { SysredditService } from './Sysreddit.service';
import type { Request } from 'express';
type AuthReq = Request & {
    user?: {
        sub?: number | string;
        id?: number | string;
        roles?: string[];
    };
};
export declare class SysredditController {
    private readonly service;
    constructor(service: SysredditService);
    getCategorias(): Promise<{
        ok: boolean;
        categorias: any;
    }>;
    getTipos(): Promise<{
        ok: boolean;
        tipos: any;
    }>;
    getStats(): Promise<{
        ok: boolean;
        stats: {
            hilos: any;
            comentarios: any;
            categorias: any;
        };
    }>;
    getHilos(req: AuthReq, categoriaId?: string, search?: string, sortBy?: 'hot' | 'new' | 'top', page?: string): Promise<{
        hilos: any;
        total: any;
        page: number;
        pages: number;
        ok: boolean;
    }>;
    getHilo(id: string, req: AuthReq): Promise<{
        ok: boolean;
        hilo: {
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
        };
    }>;
    getBlogs(req: AuthReq, categoriaId?: string, search?: string, sortBy?: 'hot' | 'new' | 'top', page?: string, kind?: 'blog' | 'articulo' | 'all'): Promise<{
        hilos: any[];
        total: number;
        page: number;
        pages: number;
        ok: boolean;
    }>;
    getArticulos(req: AuthReq, categoriaId?: string, search?: string, sortBy?: 'hot' | 'new' | 'top', page?: string): Promise<{
        hilos: any[];
        total: number;
        page: number;
        pages: number;
        ok: boolean;
    }>;
    getBlog(id: string, req: AuthReq, kind?: 'blog' | 'articulo'): Promise<{
        ok: boolean;
        blog: {
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
        };
    }>;
    getArticulo(id: string, req: AuthReq): Promise<{
        ok: boolean;
        articulo: {
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
        };
    }>;
    createBlog(req: AuthReq, body: {
        titulo: string;
        contenido: string;
        categoriaId: number;
        tipoId?: number;
        formato?: 'blog' | 'articulo';
        coverImageUrl?: string;
    }): Promise<{
        ok: boolean;
        blog: {
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
        };
    }>;
    createArticulo(req: AuthReq, body: {
        titulo: string;
        contenido: string;
        categoriaId: number;
        tipoId?: number;
        coverImageUrl?: string;
    }): Promise<{
        ok: boolean;
        articulo: {
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
        };
    }>;
    uploadBlogCover(file?: Express.Multer.File): Promise<{
        ok: boolean;
        url: string | null;
    }>;
    votarBlog(id: string, req: AuthReq, body: {
        isUp: boolean;
    }, kind?: 'blog' | 'articulo'): Promise<{
        id: number;
        upvotes: number;
        hasUpvoted: boolean;
        hasDownvoted: boolean;
        action: string;
        ok: boolean;
    }>;
    votarArticulo(id: string, req: AuthReq, body: {
        isUp: boolean;
    }): Promise<{
        id: number;
        upvotes: number;
        hasUpvoted: boolean;
        hasDownvoted: boolean;
        action: string;
        ok: boolean;
    }>;
    getBlogComentarios(id: string, req: AuthReq, kind?: 'blog' | 'articulo'): Promise<{
        ok: boolean;
        comentarios: any;
    }>;
    getArticuloComentarios(id: string, req: AuthReq): Promise<{
        ok: boolean;
        comentarios: any;
    }>;
    createBlogComentario(id: string, req: AuthReq, body: {
        texto: string;
        parentId?: number;
    }, kind?: 'blog' | 'articulo'): Promise<{
        ok: boolean;
        comentario: {
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
        };
    }>;
    createArticuloComentario(id: string, req: AuthReq, body: {
        texto: string;
    }): Promise<{
        ok: boolean;
        comentario: {
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
        };
    }>;
    createHilo(req: AuthReq, body: {
        titulo: string;
        contenido: string;
        categoriaId: number;
        tipoId?: number;
    }): Promise<{
        ok: boolean;
        hilo: {
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
        };
    }>;
    updateHilo(id: string, req: AuthReq, body: {
        titulo?: string;
        contenido?: string;
        categoriaId?: number;
        tipoId?: number;
        coverImageUrl?: string;
    }): Promise<{
        ok: boolean;
        hilo: any;
    }>;
    updateBlog(id: string, req: AuthReq, kind: "blog" | "articulo" | undefined, body: {
        titulo?: string;
        contenido?: string;
        categoriaId?: number;
        tipoId?: number;
        coverImageUrl?: string;
    }): Promise<{
        ok: boolean;
        blog: {
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
        };
    }>;
    updateArticulo(id: string, req: AuthReq, body: {
        titulo?: string;
        contenido?: string;
        categoriaId?: number;
        tipoId?: number;
        coverImageUrl?: string;
    }): Promise<{
        ok: boolean;
        articulo: {
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
        };
    }>;
    deleteHilo(id: string, req: AuthReq): Promise<{
        ok: boolean;
    }>;
    pinHilo(id: string, body: {
        isPinned: boolean;
    }): Promise<any>;
    featureHilo(id: string, body: {
        isFeatured: boolean;
    }): Promise<any>;
    reportHilo(id: string, body: {
        reportado: boolean;
    }): Promise<any>;
    votar(id: string, req: AuthReq, body: {
        isUp: boolean;
    }): Promise<{
        id: number;
        upvotes: number;
        hasUpvoted: boolean;
        hasDownvoted: boolean;
        action: string;
        ok: boolean;
    }>;
    getComentarios(id: string, req: AuthReq): Promise<{
        ok: boolean;
        comentarios: any;
    }>;
    createComentario(id: string, req: AuthReq, body: {
        texto: string;
        parentId?: number;
    }): Promise<{
        ok: boolean;
        comentario: {
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
        };
    }>;
    deleteComentario(id: string, req: AuthReq): Promise<{
        ok: boolean;
    }>;
    votarComentario(id: string, req: AuthReq, body: {
        isUp: boolean;
    }): Promise<any>;
    createCategoria(body: {
        categoria: string;
    }): Promise<{
        ok: boolean;
        categoria: {
            id: any;
            nombre: any;
        };
    }>;
    deleteCategoria(id: string): Promise<{
        ok: boolean;
    }>;
    createTipo(body: {
        tipo: string;
    }): Promise<{
        ok: boolean;
        tipo: {
            id: any;
            nombre: any;
        };
    }>;
    deleteTipo(id: string): Promise<{
        ok: boolean;
    }>;
}
export {};
