import * as crypto from "crypto";

export function generateUUID(): string {
  return [
    crypto.randomBytes(4).toString("hex"),
    crypto.randomBytes(2).toString("hex"),
    crypto.randomBytes(2).toString("hex"),
    crypto.randomBytes(2).toString("hex"),
    crypto.randomBytes(6).toString("hex")
  ].join("-");
}
