jest.mock("../database");

const request = require("supertest");
const database = require("../database");
const server = require("../server");
const { issueApiKey } = require("./testUtils");

describe("/subtasks", () => {
    let apiKey;

    beforeEach(() => {
        apiKey = issueApiKey({ id: 1, email: "owner@example.com" });
    });

    afterEach(() => jest.clearAllMocks());

    it("404s when the project doesn't belong to the authenticated user", async () => {
        database.query.mockResolvedValueOnce([]); // assertOwnsProject finds nothing

        const res = await request(server).get(`/subtasks/1/subtasks?apiKey=${apiKey}`);
        expect(res.status).toBe(404);
    });

    it("lists subtasks for an owned project", async () => {
        database.query
            .mockResolvedValueOnce([{ id: 1 }]) // ownership check passes
            .mockResolvedValueOnce([{ id: 1, task: "Pack boxes", completed: 0 }]);

        const res = await request(server).get(`/subtasks/1/subtasks?apiKey=${apiKey}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
    });

    it("updates a subtask using the correct `task` column (regression test for the title/task column bug)", async () => {
        database.query
            .mockResolvedValueOnce([{ id: 1 }]) // ownership check
            .mockResolvedValueOnce({ affectedRows: 1 }); // UPDATE subtasks

        const res = await request(server)
            .put(`/subtasks/1/subtasks/5?apiKey=${apiKey}`)
            .send({ completed: true });

        expect(res.status).toBe(200);
        const [sql] = database.query.mock.calls[1];
        expect(sql).toMatch(/\btask\s*=\s*COALESCE/);
        expect(sql).not.toMatch(/\btitle\s*=/);
    });
});
