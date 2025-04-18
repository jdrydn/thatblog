import bcrypt from 'bcryptjs';

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function comparePassword(hash: string, password: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
