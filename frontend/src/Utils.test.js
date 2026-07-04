import { formatTimestamp, convertDateTimeToReadableFormat, emailPattern } from "./Utils";

describe("emailPattern", () => {
  it("accepts well-formed emails", () => {
    expect(emailPattern.test("user@example.com")).toBe(true);
  });

  it("rejects malformed emails", () => {
    expect(emailPattern.test("not-an-email")).toBe(false);
    expect(emailPattern.test("missing@domain")).toBe(false);
    expect(emailPattern.test("@example.com")).toBe(false);
  });
});

describe("formatTimestamp", () => {
  it("formats a timestamp as 'YYYY-MM-DD HH:MM:SS'", () => {
    const timestamp = Date.UTC(2026, 0, 15, 10, 30, 0); // 2026-01-15T10:30:00Z
    expect(formatTimestamp(timestamp)).toBe("2026-01-15 10:30:00");
  });
});

describe("convertDateTimeToReadableFormat", () => {
  it("throws when given a non-string input", () => {
    expect(() => convertDateTimeToReadableFormat(12345)).toThrow(/Invalid input type/);
  });

  it("throws when given an unparsable date string", () => {
    expect(() => convertDateTimeToReadableFormat("not-a-date")).toThrow(/Invalid date format/);
  });

  it("formats a valid datetime string into a readable date", () => {
    const result = convertDateTimeToReadableFormat("2026-01-15 10:30:00");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
