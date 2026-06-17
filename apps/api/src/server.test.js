import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "./server.js";

test("health endpoint reports service status", async () => {
  const response = await request(app).get("/health").expect(200);

  assert.equal(response.body.status, "ok");
  assert.equal(response.body.service, "chamatrust-api");
});

test("mobile money provider list includes supported rails", async () => {
  const response = await request(app).get("/mobile-money/providers").expect(200);
  const names = response.body.providers.map((provider) => provider.name);

  assert.deepEqual(names, ["M-Pesa", "Airtel Money", "Tigo Pesa", "HaloPesa"]);
});
