/**
 * Matthew Hill Deal Scout — Cloudflare Worker Proxy
 * Avila Phoenix Ventures, LLC · Operated by Brian Wyss
 *
 * Holds the Anthropic API key as an encrypted secret so the browser
 * never sees it. Forwards Deal Scout requests to the Anthropic API.
 *
 * Deploy:  Workers & Pages → Create Worker → name "mh-scout"
 * Secret:  Settings → Variables → Encrypt → ANTHROPIC_API_KEY = sk-ant-...
 */

const ALLOWED_ORIGINS = [
  'https://brianwyss-acqnetwork.github.io',
  'http://localhost:8080'
];

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    // Health check
    if (request.method === 'GET') {
      return new Response(JSON.stringify({
        service: 'Matthew Hill Deal Scout Worker',
        status: 'ok',
        operator: 'Avila Phoenix Ventures, LLC'
      }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: cors });
    }

    if (!env.ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured on Worker' }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    try {
      const payload = await request.text();
      const upstream = await fetch(ANTHROPIC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: payload
      });
      const body = await upstream.text();
      return new Response(body, {
        status: upstream.status,
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Proxy error: ' + err.message }),
        { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } });
    }
  }
};
