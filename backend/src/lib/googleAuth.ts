import { OAuth2Client } from "google-auth-library";

import { env } from "../env";
import { HttpError } from "./httpError";

const client = new OAuth2Client(env.googleClientId);

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

// Verifies a Google-issued ID token (obtained client-side via Google Identity
// Services) against Google's public keys and our client ID, so we never trust
// a caller-supplied identity without cryptographic proof.
export async function verifyGoogleIdToken(
  idToken: string,
): Promise<GoogleProfile> {
  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.googleClientId,
    });
    payload = ticket.getPayload();
  } catch {
    throw new HttpError(401, "Invalid Google token");
  }

  if (!payload?.sub || !payload.email) {
    throw new HttpError(401, "Invalid Google token");
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name ?? payload.email,
    avatarUrl: payload.picture,
  };
}
