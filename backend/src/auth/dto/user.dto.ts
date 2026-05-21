// PII-safe User DTO

import { maskPhone, maskEmail } from '../../common/utils/pii';

export interface SafeUser {
  id: string;
  full_name: string | null;
  username: string;
  role: any; // Using any to avoid Prisma enum type issues
  region: string | null;
  user_code: never;
  created_at: Date;
  volunteer: any;
}

export function toSafeUser(user: any): SafeUser {
  const result: any = {
    id: String(user.id),
    full_name: user.fullName || user.full_name,
    username: user.username,
    role: user.role,
    region: user.region,
    created_at: user.created_at,
    volunteer: user.volunteer || null,
  };
  // Only include user_code if it exists
  if (user.userCode || user.user_code) {
    result.user_code = user.userCode || user.user_code;
  }
  return result;
}
