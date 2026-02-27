import { createObraBodySchema } from "../obra/obra.schema";

describe("createObraBodySchema", () => {
  it("accepts valid data", () => {
    const result = createObraBodySchema.parse({ name: "Obra Alpha" });
    expect(result.name).toBe("Obra Alpha");
  });

  it("accepts optional initials", () => {
    const result = createObraBodySchema.parse({
      name: "Obra Alpha",
      initials: "OA",
    });
    expect(result.initials).toBe("OA");
  });

  it("accepts null initials", () => {
    const result = createObraBodySchema.parse({
      name: "Obra Alpha",
      initials: null,
    });
    expect(result.initials).toBeNull();
  });

  it("rejects name shorter than 2 chars", () => {
    expect(() => createObraBodySchema.parse({ name: "A" })).toThrow();
  });

  it("rejects name longer than 100 chars", () => {
    expect(() =>
      createObraBodySchema.parse({ name: "A".repeat(101) }),
    ).toThrow();
  });

  it("rejects missing name", () => {
    expect(() => createObraBodySchema.parse({})).toThrow();
  });
});
