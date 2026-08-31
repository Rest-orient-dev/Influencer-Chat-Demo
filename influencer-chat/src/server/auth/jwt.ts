import jwt from "jsonwebtoken";

export type AuthTokenPayload = {
  sub: string; // userId
  role: "admin" | "agent";
  name: string;
};

const secret = () => {
  // 本地开发不一定会配置密钥；为了让你能跑通 MVP，这里提供 dev fallback。
  return process.env.AUTH_SECRET || "dev-auth-secret";
};

export function signAuthToken(payload: AuthTokenPayload) {
  const token = jwt.sign(payload, secret(), {
    expiresIn: "2h",
  });
  return token;
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, secret()) as AuthTokenPayload;
  return decoded;
}

