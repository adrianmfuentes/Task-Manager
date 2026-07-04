jest.mock("../database");

const request = require("supertest");
const database = require("../database");
const server = require("../server");
const { issueApiKey } = require("./testUtils");

describe("/projects", () => {
    let apiKey;

    beforeEach(() => {
        apiKey = issueApiKey();
    });

    afterEach(() => jest.clearAllMocks());

    it("creates a project with subtasks", async () => {
        database.query
            .mockResolvedValueOnce({ insertId: 7 }) // INSERT INTO projects
            .mockResolvedValueOnce({}); // INSERT INTO subtasks

        const res = await request(server)
            .post(`/projects?apiKey=${apiKey}`)
            .send({ title: "House move", subtasks: [{ task: "Pack boxes" }] });

        expect(res.status).toBe(201);
        expect(res.body.insertedId).toBe(7);
        expect(database.query).toHaveBeenCalledTimes(2);
    });

    it("a completed-only update does not touch subtasks (regression test)", async () => {
        database.query.mockResolvedValueOnce({ affectedRows: 1 }); // UPDATE projects only

        const res = await request(server).put(`/projects/1?apiKey=${apiKey}`).send({ completed: true });

        expect(res.status).toBe(200);
        expect(database.query).toHaveBeenCalledTimes(1); // no DELETE/INSERT on subtasks
        const [sql, params] = database.query.mock.calls[0];
        expect(sql).toMatch(/COALESCE/);
        expect(params).toContain(true);
    });

    it("replaces subtasks when a subtasks array is explicitly provided", async () => {
        database.query
            .mockResolvedValueOnce({ affectedRows: 1 }) // UPDATE projects
            .mockResolvedValueOnce({}) // DELETE subtasks
            .mockResolvedValueOnce({}); // INSERT subtasks

        const res = await request(server)
            .put(`/projects/1?apiKey=${apiKey}`)
            .send({ subtasks: [{ task: "New item", completed: false }] });

        expect(res.status).toBe(200);
        expect(database.query).toHaveBeenCalledTimes(3);
    });

    it("editing just the title actually updates the title column (regression test for the name/title mismatch bug)", async () => {
        database.query.mockResolvedValueOnce({ affectedRows: 1 });

        const res = await request(server).put(`/projects/1?apiKey=${apiKey}`).send({ title: "New name" });

        expect(res.status).toBe(200);
        const [, params] = database.query.mock.calls[0];
        expect(params[0]).toBe("New name");
    });
});
