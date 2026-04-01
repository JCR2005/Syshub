import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        correoInstitucional: string;
        edad: number | null;
        bloqueado: boolean;
        nombre: string | null;
        id: number;
    }[]>;
    create(dto: CreateUserDto): Promise<{
        correoInstitucional: string;
        edad: number | null;
        bloqueado: boolean;
        nombre: string | null;
        id: number;
    }>;
    getProfile(id: number): Promise<{
        rangos: string[];
        roles: string[];
        correoInstitucional: string;
        nombre: string | null;
        carnet: string | null;
        id: number;
    }>;
}
