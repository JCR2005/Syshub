export declare class CreateThreadDto {
    titulo: string;
    contenido: string;
    categoria?: string;
    tags?: string[];
}
export declare class CreateCommentDto {
    texto: string;
}
export declare class UpdateThreadDto {
    titulo?: string;
    contenido?: string;
    categoria?: string;
    tags?: string[];
}
export declare class CreateBlogDto {
    titulo: string;
    contenido: string;
    extracto: string;
    categoria?: string;
    tags?: string[];
    readTime?: number;
}
