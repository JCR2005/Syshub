import {
  BadGatewayException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class CicsService {
  private readonly baseUrl =
    process.env.CICS_API_BASE?.replace(/\/+$/, '') ||
    'https://cics.cunoc.edu.gt/api';

  async getStudentInfo(ra: string, pin: string) {
    const url = `${this.baseUrl}/auth/student-info?ra=${encodeURIComponent(ra)}&pin=${encodeURIComponent(pin)}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
    } catch {
      throw new BadGatewayException(
        'No se pudo conectar con el servicio académico CICS',
      );
    }

    let payload: Record<string, unknown> | null = null;
    try {
      const parsed: unknown = await response.json();
      if (parsed && typeof parsed === 'object') {
        payload = parsed as Record<string, unknown>;
      }
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const upstreamMessage = this.extractMessage(payload);
      if (response.status === 401 || response.status === 403) {
        throw new UnauthorizedException(
          upstreamMessage || 'Credenciales CICS inválidas',
        );
      }

      throw new BadGatewayException(
        upstreamMessage ||
          'No se pudo obtener información académica desde CICS',
      );
    }

    return {
      ok: true,
      data: payload,
    };
  }

  private extractMessage(payload: Record<string, unknown> | null): string {
    if (!payload) return '';

    const message = payload.message;
    if (typeof message === 'string') return message;

    const error = payload.error;
    if (error && typeof error === 'object') {
      const nestedMessage = (error as Record<string, unknown>).message;
      if (typeof nestedMessage === 'string') return nestedMessage;
    }

    return '';
  }
}
