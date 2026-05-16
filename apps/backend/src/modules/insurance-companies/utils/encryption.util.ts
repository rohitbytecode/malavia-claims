import crypto from "crypto";
import { env } from "@/config/env.js";

const ALGORITHM = "aes-256-cbc";
const KEY = crypto
  .createHash("sha256")
  .update(env.PORTAL_PASSWORD_SECRET)
  .digest();
const IV_LENGTH = 16;

export const encryptPortalPassword = (password: string) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(password, "utf8"),
    cipher.final(),
  ]);

  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

export const decryptPortalPassword = (encrypted: string) => {
  const [ivHex, encryptedText] = encrypted.split(":");

  if (!ivHex || !encryptedText) {
    return "";
  }

  const iv = Buffer.from(ivHex, "hex");
  const encryptedBuffer = Buffer.from(encryptedText, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);

  return Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final(),
  ]).toString("utf8");
};
