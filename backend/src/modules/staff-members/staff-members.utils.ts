import { createHash, randomBytes } from "node:crypto";

// 32 random bytes in base64url = 43 characters (A-Z a-z 0-9 - _).
// The database function staff_member_id_from_token() checks the same format.
export const STAFF_LINK_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function generateStaffLinkToken(): string {
	return randomBytes(32).toString("base64url");
}

// Only this hash is stored. It must match
// encode(extensions.digest(token, 'sha256'), 'hex') in Postgres.
export function hashStaffLinkToken(token: string): string {
	return createHash("sha256").update(token).digest("hex");
}
