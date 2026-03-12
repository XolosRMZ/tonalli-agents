const fs = require('fs');
const http = require('http');
const path = require('path');

loadEnvFiles([
  path.join(__dirname, '.env'),
  path.join(__dirname, 'xolo-treasury-agent', '.env'),
  path.join(__dirname, 'tonalli-agent-sdk', '.env'),
  path.join(__dirname, 'tonalli-cli', '.env'),
]);

const HOST = '127.0.0.1';
const PORT = 8787;
const DAILY_LIMIT_SATS = parsePositiveInteger(process.env.AGENT_DAILY_LIMIT_SATS, 0);

function loadEnvFiles(filePaths) {
  filePaths.forEach((filePath) => {
    if (!fs.existsSync(filePath)) {
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        return;
      }

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) {
        return;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();

      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    });
  });
}

function parsePositiveInteger(value, fallbackValue) {
  const parsed = Number.parseInt(String(value || ''), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallbackValue;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;

      if (body.length > 1024 * 1024) {
        reject(new Error('Body too large'));
        req.destroy();
      }
    });

    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });

    req.on('error', reject);
  });
}

function extractRequestedSats(payload) {
  const candidates = [
    payload.amountSats,
    payload.amount,
    payload.sats,
    payload.txSats,
    payload?.tx?.amountSats,
    payload?.tx?.amount,
  ];

  for (const candidate of candidates) {
    const parsed = parsePositiveInteger(candidate, -1);
    if (parsed >= 0) {
      return parsed;
    }
  }

  return null;
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload, null, 2));
}

const server = http.createServer(async (req, res) => {
  if (req.method !== 'POST' || req.url !== '/v1/preflight/sign') {
    sendJson(res, 404, {
      ok: false,
      error: 'Not found',
      expected: 'POST /v1/preflight/sign',
    });
    return;
  }

  try {
    const payload = await readJsonBody(req);
    const requestedSats = extractRequestedSats(payload);

    if (requestedSats === null) {
      sendJson(res, 400, {
        ok: false,
        decision: 'deny',
        reason: 'Missing amount in sats',
        acceptedFields: ['amountSats', 'amount', 'sats', 'txSats', 'tx.amountSats', 'tx.amount'],
      });
      return;
    }

    const approved = DAILY_LIMIT_SATS > 0 && requestedSats <= DAILY_LIMIT_SATS;

    sendJson(res, approved ? 200 : 403, {
      ok: approved,
      decision: approved ? 'approve' : 'deny',
      constitutionalBasis: approved
        ? 'Requested amount is within AGENT_DAILY_LIMIT_SATS'
        : 'Requested amount exceeds AGENT_DAILY_LIMIT_SATS',
      requestedSats,
      dailyLimitSats: DAILY_LIMIT_SATS,
      agentId: process.env.AGENT_ID || null,
      agentRole: process.env.AGENT_ROLE || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    sendJson(res, 400, {
      ok: false,
      decision: 'deny',
      reason: error.message,
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(
    `CAE listening on http://${HOST}:${PORT}/v1/preflight/sign with AGENT_DAILY_LIMIT_SATS=${DAILY_LIMIT_SATS}`
  );
});
