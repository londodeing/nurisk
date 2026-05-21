import { IUser } from '../types/user';

// Login DTO - credentials for authentication
export class LoginDTO {
  username: string; // or email
  password: string;
}

// Register DTO - fields needed to create a new user
export class RegisterDTO {
  username: string; // UQ
  password: string;
  full_name: string;
  role: string; // 10 enum
  region: string;
  email: string;
  phone_number: string;
  whatsapp_number?: string;
  avatar_url?: string;
}

// Token Response DTO - what gets returned after successful authentication
export class TokenResponseDTO {
  access_token: string;
  expires_in: number; // seconds until expiration
  token_type: string = 'Bearer';
  user: {
    id: string;
    username: string;
    full_name: string;
    role: string;
    email: string;
    phone_number: string;
    region: string;
  };
}