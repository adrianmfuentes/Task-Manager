jest.mock("../database");

const request = require("supertest");
const database = require("../database");
const server = require("../server");
const { issueApiKey } = require("./testUtils");

describe("apiKey auth middleware", () => {
    afterEach(() => jest.clearAllMocks());

    it("rejects requests with no apiKey", async () => {
        const res = await request(server).get("/tasks");
        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/No API key/i);
    });

    it("rejects requests with a malformed apiKey", async () => {
        const res = await request(server).get("/tasks?apiKey=not-a-jwt");
        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/Invalid API key/i);
    });

    it("rejects a validly-signed apiKey that isn't in the active list", async () => {
        const jwt = require("jsonwebtoken");
        const { JWT_SECRET } = require("../config");
        const orphanKey = jwt.sign({ id: 99 }, JWT_SECRET, { expiresIn: "1h" });

        const res = await request(server).get(`/tasks?apiKey=${orphanKey}`);
        expect(res.status).toBe(401);
        expect(res.body.error).toMatch(/inactive/i);
    });

    it("accepts an active apiKey passed as a query param", async () => {
        database.query.mockResolvedValueOnce([]);
        const apiKey = issueApiKey();

        const res = await request(server).get(`/tasks?apiKey=${apiKey}`);
        expect(res.status).toBe(200);
    });

    it("accepts an active apiKey passed as a header (used by the subtasks calls in the frontend)", async () => {
        database.query.mockResolvedValueOnce([]);
        const apiKey = issueApiKey();

        const res = await request(server).get("/tasks").set("apiKey", apiKey);
        expect(res.status).toBe(200);
    });

    it("protects /subtasks too (this used to be open to anyone)", async () => {
        const res = await request(server).get("/subtasks/1/subtasks");
        expect(res.status).toBe(401);
    });
});
