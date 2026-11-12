const http = require("node:http");
const MAX_BODY = 1024 * 1024;
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let exceeded = false;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        if (!exceeded) {
          exceeded = true;
          chunks.length = 0;
          reject(
            Object.assign(new Error("Payload Too Large"), { status: 413 }),
          );
        }
      } else if (!exceeded) chunks.push(chunk);
    });
    req.on("end", () => {
      console.log("Body bytes:", size);
      if (!exceeded) resolve(Buffer.concat(chunks));
    });
    req.on("error", reject);
    req.on("aborted", () => reject(new Error("Request aborted")));
  });
}
function createServer() {
  return http.createServer(async (req, res) => {
    res.on("finish", () =>
      console.log(
        new Date().toISOString(),
        req.method,
        req.url,
        res.statusCode,
      ),
    );
    res.setHeader("X-Powered-By", "Node.js");
    res.setHeader("X-Group", "477");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    function json(value, status = 200) {
      res.statusCode = status;
      res.end(JSON.stringify(value));
    }
    const route = new URL(req.url, "http://localhost").pathname;
    try {
      if (req.method === "GET" || req.method === "HEAD") {
        if (route === "/headers")
          return json({
            headers: req.headers,
            httpVersion: req.httpVersion,
            method: req.method,
            url: req.url,
          });
        if (route === "/headers/check")
          return json({
            hasContentType: res.hasHeader("Content-Type"),
            hasXGroup: res.hasHeader("X-Group"),
            hasUnknown: res.hasHeader("Unknown"),
            group: res.getHeader("X-Group"),
          });
        if (route === "/headers/set") {
          res.setHeader("X-Demo", "temporary");
          res.removeHeader("X-Demo");
          return json({
            group: res.getHeader("X-Group"),
            removed: !res.hasHeader("X-Demo"),
          });
        }
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        if (route === "/")
          return res.end("<h1>Laboratory Work 20</h1><p>Group: 477</p>");
        if (route === "/about")
          return res.end(
            "<h1>About</h1><p>Zubelik Trofim Alekseevich, group 477</p>",
          );
        res.statusCode = 404;
        return res.end("<h1>404 Not Found</h1>");
      }
      if (req.method === "POST" && ["/echo", "/form"].includes(route)) {
        const body = await readBody(req);
        const type = (req.headers["content-type"] || "application/octet-stream")
          .split(";")[0]
          .trim();
        if (type === "application/json") {
          let data;
          try {
            data = JSON.parse(body.toString("utf8"));
          } catch {
            return json({ error: "Invalid JSON" }, 400);
          }
          if (!data || typeof data !== "object" || Array.isArray(data))
            return json({ error: "JSON object required" }, 400);
          return json({ ...data, group: "477" });
        }
        if (type === "application/x-www-form-urlencoded")
          return json(
            Object.fromEntries(new URLSearchParams(body.toString("utf8"))),
          );
        res.setHeader("Content-Type", type);
        return res.end(body);
      }
      json({ error: "Not found" }, 404);
    } catch (error) {
      json({ error: error.message }, error.status || 500);
    }
  });
}
if (require.main === module)
  createServer().listen(3000, () =>
    console.log("Server listening on http://localhost:3000"),
  );
module.exports = { createServer };
