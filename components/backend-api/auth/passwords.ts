import bcrypt from 'bcryptjs';

// bcryptjs is pure JS (no native build), so it runs unchanged in Lambda (PLAN.md 7, 10.1). Cost 10
// is the common default: strong enough today, well under the API Gateway timeout on login.
const COST = 10;

export const hashPassword = (plain: string): Promise<string> => bcrypt.hash(plain, COST);

export const verifyPassword = (plain: string, hash: string): Promise<boolean> => bcrypt.compare(plain, hash);
