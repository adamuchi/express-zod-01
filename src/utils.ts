import { randomBytes } from "crypto";

export function generateToken(size = 32) {
    const token = randomBytes(size).toString('base64');
    const trimmed = token.substring(0, token.indexOf('='));
    return trimmed.replace(/\//g, ".").replace(/\+/g, "-");
}
