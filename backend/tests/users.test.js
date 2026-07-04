jest.mock("../database");

const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const database = require("../database");
const server = require("../server");
const { JWT_SECRET } = require("../config");

describe("POST /users (register)", () => {
    afterEach(() => jest.clearAllMocks());

    it("rejects missing email/password", async () => {
        const res = await request(server).post("/users").send({});
        expect(res.status).toBe(400);
        expect(res.body.error).toEqual(expect.arrayContaining([
            expect.stringContaining("email"),
            expect.stringContaining("password"),
        ]));
    });

    it("rejects an invalid email format", async () => {
        const res = await request(server).post("/users").send({ email: "not-an-email", password: "longenough" });
        expect(res.status).toBe(400);
    });

    it("rejects a too-short password", async () => {
        const res = await request(server).post("/users").send({ email: "a@b.com", password: "abc" });
        expect(res.status).toBe(400);
    });

    it("rejects duplicate emails", async () => {
        database.query.mockResolvedValueOnce([{ email: "a@b.com" }]);
        const res = await request(server).post("/users").send({ email: "a@b.com", password: "longenough" });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/Already a user/i);
    });

    it("hashes the password before storing it - never stores plaintext", async () => {
        database.query
            .mockResolvedValueOnce([]) // no existing user
            .mockResolvedValueOnce({ insertId: 1 }); // insert result

        const res = await request(server).post("/users").send({ email: "a@b.com", password: "plaintext123" });
        expect(res.status).toBe(200);

        const insertCall = database.query.mock.calls[1];
        const storedPassword = insertCall[1][1];
        expect(storedPassword).not.toBe("plaintext123");
        expect(storedPassword).toMatch(/^\$2[aby]\$/); // bcrypt hash prefix
        await expect(bcrypt.compare("plaintext123", storedPassword)).resolves.toBe(true);
    });
});

describe("POST /users/login", () => {
    afterEach(() => jest.clearAllMocks());

    it("rejects an unknown email", async () => {
        database.query.mockResolvedValueOnce([]);
        const res = await request(server).post("/users/login").send({ email: "nobody@example.com", password: "whatever1" });
        expect(res.status).toBe(401);
    });

    it("rejects a wrong password", async () => {
        const hash = await bcrypt.hash("correct-password", 4);
        database.query.mockResolvedValueOnce([{ id: 1, email: "a@b.com", password: hash }]);

        const res = await request(server).post("/users/login").send({ email: "a@b.com", password: "wrong-password" });
        expect(res.status).toBe(401);
    });

    it("logs in with the correct password and returns a signed, expiring apiKey", async () => {
        const hash = await bcrypt.hash("correct-password", 4);
        database.query.mockResolvedValueOnce([{ id: 1, email: "a@b.com", password: hash }]);

        const res = await request(server).post("/users/login").send({ email: "a@b.com", password: "correct-password" });
        expect(res.status).toBe(200);
        expect(res.body.apiKey).toBeTruthy();

        const decoded = jwt.verify(res.body.apiKey, JWT_SECRET);
        expect(decoded.id).toBe(1);
        expect(decoded.exp).toBeTruthy(); // token has an expiry, unlike the original implementation
    });
});
