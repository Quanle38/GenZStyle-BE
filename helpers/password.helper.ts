// helpers/password.helper.ts
import bcrypt from "bcrypt";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

export const hashPassword = async (plain: string): Promise<string> => {
  const hashed = await bcrypt.hash(plain, SALT_ROUNDS);
  return hashed;
};

/**
 * verifyPassword:
 * - Nếu storedPassword có dấu hiệu là bcrypt hash (bắt đầu bằng $2a$/$2b$...), dùng bcrypt.compare
 * - Nếu không (plaintext trong DB), so sánh trực tiếp. Nếu khớp, caller có thể hash & cập nhật DB.
 */
export const verifyPassword = async (
  candidate: string,
  storedPassword: string
): Promise<{ ok: boolean; needsRehash: boolean }> => {
  const looksHashed = typeof storedPassword === "string" && /^\$2[aby]\$/.test(storedPassword);
  if (looksHashed) {
    const ok = await bcrypt.compare(candidate, storedPassword);
    return { ok, needsRehash: false };
  } else {
    // stored as plaintext
    const ok = candidate === storedPassword;
    // nếu đúng, nên hash lại và cập nhật DB (caller tự làm)
    return { ok, needsRehash: ok };
  }
};
