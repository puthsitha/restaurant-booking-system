import type { User } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/httpError";
import { hashPassword, comparePassword } from "../lib/password";
import { signAuthToken } from "../lib/jwt";
import { verifyGoogleIdToken } from "../lib/googleAuth";
import type {
  SignupInput,
  LoginInput,
  GoogleAuthInput,
} from "../schemas/auth.schemas";

// Never send the password hash back to a client.
function toPublicUser(user: User) {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}
export type PublicUser = ReturnType<typeof toPublicUser>;

export interface AuthResult {
  user: PublicUser;
  token: string;
}

function assertActive(user: User): void {
  if (user.status === "SUSPENDED") {
    throw new HttpError(403, "This account has been suspended");
  }
}

export async function signup(input: SignupInput): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    throw new HttpError(409, "An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    },
  });

  return { user: toPublicUser(user), token: signAuthToken({ sub: user.id, role: user.role }) };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user?.passwordHash || !(await comparePassword(input.password, user.passwordHash))) {
    throw new HttpError(401, "Invalid email or password");
  }
  assertActive(user);

  return { user: toPublicUser(user), token: signAuthToken({ sub: user.id, role: user.role }) };
}

export async function loginWithGoogle(input: GoogleAuthInput): Promise<AuthResult> {
  const profile = await verifyGoogleIdToken(input.idToken);

  let user = await prisma.user.findUnique({
    where: { googleId: profile.googleId },
  });

  if (!user) {
    // Link to an existing account with the same email rather than creating a
    // duplicate user for someone who already signed up with a password.
    const existingByEmail = await prisma.user.findUnique({
      where: { email: profile.email },
    });

    user = existingByEmail
      ? await prisma.user.update({
          where: { id: existingByEmail.id },
          data: { googleId: profile.googleId },
        })
      : await prisma.user.create({
          data: {
            name: profile.name,
            email: profile.email,
            googleId: profile.googleId,
            avatarUrl: profile.avatarUrl,
          },
        });
  }

  assertActive(user);

  return { user: toPublicUser(user), token: signAuthToken({ sub: user.id, role: user.role }) };
}

export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError(404, "User not found");
  }
  return toPublicUser(user);
}
