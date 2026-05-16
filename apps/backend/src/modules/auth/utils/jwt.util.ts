import { sign, verify } from "jsonwebtoken";
import { env } from "@/config/env.js";
import { Roles } from "@/core/enums/roles.enum.js";

export interface TokenPayload {
  userId: string;
  role: Roles;
}

export const signAccessToken = (payload: TokenPayload) => {
  return (sign as unknown as (...args: any[]) => string)(
    payload,
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
    }
  );
};

export const signRefreshToken = (payload: TokenPayload) => {
  return (sign as unknown as (...args: any[]) => string)(
    payload,
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
    }
  );
};

export const verifyAccessToken = (token: string) => {
  return (verify as unknown as (...args: any[]) => any)(
    token,
    env.JWT_ACCESS_SECRET
  ) as TokenPayload;
};

export const verifyRefreshToken = (token: string) => {
  return (verify as unknown as (...args: any[]) => any)(
    token,
    env.JWT_REFRESH_SECRET
  ) as TokenPayload;
};
