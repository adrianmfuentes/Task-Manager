jest.mock("../database");

const request = require("supertest");
const database = require("../database");
const server = require("../server");
const { issueApiKey } = require("./testUtils");

describe("/tasks", () => {
    let apiKey;

    beforeEach(() => {
        apiKey = issueApiKey();
    });

    afterEach(() => jest.clearAllMocks());

    it("rejects task creation without a title", async () => {
        const res = await request(server).post(`/tasks?apiKey=${apiKey}`).send({ description: "no title" });
        expect(res.status).toBe(400);
    });

    it("creates a task", async () => {
        database.query.mockResolvedValueOnce({ insertId: 42 });
        const res = await request(server).post(`/tasks?apiKey=${apiKey}`).send({ title: "Buy milk" });
        expect(res.status).toBe(201);
        expect(res.body.insertedId).toBe(42);
    });

    it("rejects an invalid status value", async () => {
        const res = await request(server).put(`/tasks/1?apiKey=${apiKey}`).send({ status: "not-a-real-status" });
        expect(res.status).toBe(400);
    });

    it("a status-only update does not blank out title/description/priority (regression test)", async () => {
        database.query.mockResolvedValueOnce({ affectedRows: 1 });
        const res = await request(server).put(`/tasks/1?apiKey=${apiKey}`).send({ status: "completed" });

        expect(res.status).toBe(200);
        const [sql, params] = database.query.mock.calls[0];
        expect(sql).toMatch(/COALESCE/);
        // title, description, priority, dateFinish come before status/id/userId in the param list
        const [title, description, priority, dateFinish, status] = params;
        expect([title, description, priority, dateFinish]).toEqual([undefined, undefined, undefined, undefined]);
        expect(status).toBe("completed");
    });

    it("returns 404 when updating a task that doesn't belong to the user", async () => {
        database.query.mockResolvedValueOnce({ affectedRows: 0 });
        const res = await request(server).put(`/tasks/999?apiKey=${apiKey}`).send({ status: "completed" });
        expect(res.status).toBe(404);
    });

    it("deletes a task", async () => {
        database.query.mockResolvedValueOnce({ affectedRows: 1 });
        const res = await request(server).delete(`/tasks/1?apiKey=${apiKey}`);
        expect(res.status).toBe(200);
        expect(res.body.deleted).toBe(true);
    });
});
