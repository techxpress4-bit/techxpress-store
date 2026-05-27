// TechXpress — Supabase keepalive Worker
// Cron daily ping to prevent the Free-tier Supabase project from auto-pausing
// after 7 days of inactivity. Any HTTP request to the project counts as
// activity; we hit the public REST API with the anon key.

async function pingSupabase(env) {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    return { ok: false, error: "missing_env", url: !!url, key: !!key };
  }
  // Query a single row from `avis` (public read by RLS). Lightweight,
  // counts as a real DB query, returns near-zero bytes.
  const t0 = Date.now();
  try {
    const res = await fetch(`${url}/rest/v1/avis?select=id&limit=1`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });
    const text = await res.text().catch(() => "");
    return {
      ok: res.ok,
      status: res.status,
      latencyMs: Date.now() - t0,
      bodyPreview: text.slice(0, 120),
    };
  } catch (e) {
    return { ok: false, error: String(e?.message || e), latencyMs: Date.now() - t0 };
  }
}

export default {
  // Cron entrypoint
  async scheduled(event, env, ctx) {
    const result = await pingSupabase(env);
    console.log(
      `[keepalive] ${new Date().toISOString()} cron=${event.cron} →`,
      JSON.stringify(result)
    );
  },

  // HTTP entrypoint for manual testing:
  // curl https://techxpress-keepalive.<account>.workers.dev/
  async fetch(request, env, ctx) {
    const result = await pingSupabase(env);
    return new Response(JSON.stringify({ keepalive: result }, null, 2), {
      status: result.ok ? 200 : 502,
      headers: { "Content-Type": "application/json" },
    });
  },
};
