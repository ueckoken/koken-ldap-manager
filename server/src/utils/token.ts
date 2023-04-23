import totp from "totp-generator";
import bcrypt from "bcryptjs";

export function generateTOTPToken(): string {
  return totp(String(process.env["TOTP_TOKEN"]), {
    digits: 8,
    algorithm: "SHA-512",
    period: 60 * 60 * 24, // 24時間の有効期限を設ける
    timestamp: new Date().getTime(),
  });
}

export function generateToken() {
  // hash token with bcrypt
  const totpToken = generateTOTPToken();
  const salt = bcrypt.genSaltSync(10);
  const hashedToken = bcrypt.hashSync(totpToken, salt);
  return hashedToken;
}

export function verifyToken(token: string): boolean {
  const totpToken = generateTOTPToken();
  return bcrypt.compareSync(totpToken, token);
}
