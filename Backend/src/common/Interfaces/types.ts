import { JwtPayload } from 'jsonwebtoken';

export interface TokenPayload extends JwtPayload {
  id: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export {};
