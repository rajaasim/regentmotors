import { describe, expect, it } from "vitest";

import { hasTrustedMutationOrigin } from "@/lib/security/request-origin";

describe("mutation request origin checks", () => {
  it("accepts same-origin requests and rejects cross-site requests", () => {
    expect(hasTrustedMutationOrigin(new Request("https://regent.example/api", { headers: { origin: "https://regent.example" } }))).toBe(true);
    expect(hasTrustedMutationOrigin(new Request("https://regent.example/api", { headers: { origin: "https://evil.example" } }))).toBe(false);
    expect(hasTrustedMutationOrigin(new Request("https://regent.example/api"))).toBe(false);
  });
});
