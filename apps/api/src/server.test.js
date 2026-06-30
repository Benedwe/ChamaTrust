import test from "node:test";
import assert from "node:assert/strict";
import { Readable, Writable } from "node:stream";

process.env.NODE_ENV = "test";
const { default: app } = await import("./server.js");

function requestApp(path, method = "GET") {
  return new Promise((resolve, reject) => {
    const req = new Readable({ read() {} });
    req.url = path;
    req.method = method;
    req.headers = {};
    req.connection = {};
    req.socket = {};
    req.push(null);

    const chunks = [];
    const headers = {};
    const res = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(Buffer.from(chunk));
        callback();
      }
    });

    res.statusCode = 200;
    res.setHeader = (name, value) => {
      headers[name.toLowerCase()] = value;
    };
    res.getHeader = (name) => headers[name.toLowerCase()];
    res.getHeaders = () => headers;
    res.removeHeader = (name) => {
      delete headers[name.toLowerCase()];
    };
    res.end = (chunk) => {
      if (chunk) chunks.push(Buffer.from(chunk));
      const bodyText = Buffer.concat(chunks).toString("utf8");
      const body = bodyText ? JSON.parse(bodyText) : undefined;
      resolve({ status: res.statusCode, headers, body });
      Writable.prototype.end.call(res);
    };

    app.handle(req, res, reject);
  });
}

test("health endpoint reports service status", async () => {
  const response = await requestApp("/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
  assert.equal(response.body.service, "chamatrust-api");
});

test("mobile money provider list includes supported rails", async () => {
  const response = await requestApp("/mobile-money/providers");
  const names = response.body.providers.map((provider) => provider.name);

  assert.equal(response.status, 200);
  assert.deepEqual(names, ["M-Pesa", "Airtel Money", "Tigo Pesa", "HaloPesa"]);
});
