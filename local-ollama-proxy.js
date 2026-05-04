#!/usr/bin/env node

const http = require("http");

const proxyPort = Number(process.env.PROXY_PORT || 8787);
const ollamaBaseUrl = process.env.OLLAMA_URL || "http://127.0.0.1:11434";

const server = http.createServer(async (request, response) => {
  setCorsHeaders(response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (!request.url.startsWith("/api/")) {
    sendJson(response, 404, { error: "Only /api/* Ollama endpoints are proxied." });
    return;
  }

  try {
    const body = await readRequestBody(request);
    const upstreamUrl = new URL(request.url, ollamaBaseUrl);
    const upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers: copyForwardHeaders(request.headers),
      body: request.method === "GET" || request.method === "HEAD" ? undefined : body
    });

    response.writeHead(upstream.status, {
      "Content-Type": upstream.headers.get("content-type") || "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
    });

    if (!upstream.body) {
      response.end();
      return;
    }

    const reader = upstream.body.getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      response.write(Buffer.from(value));
    }
    response.end();
  } catch (error) {
    sendJson(response, 502, {
      error: `Proxy failed to reach Ollama at ${ollamaBaseUrl}: ${error.message}`
    });
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${proxyPort} is already in use. Try: PROXY_PORT=8788 node local-ollama-proxy.js`);
    process.exit(1);
  }

  console.error(`Failed to start local proxy on 127.0.0.1:${proxyPort}: ${error.message}`);
  process.exit(1);
});

server.listen(proxyPort, "127.0.0.1", () => {
  console.log(`Local Ollama proxy listening on http://127.0.0.1:${proxyPort}`);
  console.log(`Forwarding /api/* to ${ollamaBaseUrl}`);
  printOllamaStatus();
});

function setCorsHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}

function copyForwardHeaders(headers) {
  const forwarded = {
    "Content-Type": headers["content-type"] || "application/json"
  };

  if (headers.authorization) {
    forwarded.Authorization = headers.authorization;
  }

  return forwarded;
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("error", reject);
    request.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  });
  response.end(JSON.stringify(payload));
}

async function printOllamaStatus() {
  try {
    const tagsUrl = new URL("/api/tags", ollamaBaseUrl);
    const response = await fetch(tagsUrl);
    if (!response.ok) {
      console.log(`Ollama responded with HTTP ${response.status}.`);
      return;
    }

    const data = await response.json();
    const models = Array.isArray(data.models) ? data.models.map((model) => model.name).filter(Boolean) : [];
    if (models.length) {
      console.log(`Installed Ollama models: ${models.join(", ")}`);
      return;
    }

    console.log("Ollama is reachable, but no local models were found. Run: ollama pull llama3.1");
  } catch (error) {
    console.log(`Ollama is not reachable at ${ollamaBaseUrl}. Start it first, then keep this proxy running.`);
  }
}
