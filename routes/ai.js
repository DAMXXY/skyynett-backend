const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// POST /api/ai
// body: { provider: 'openai'|'anthropic', input: string, model?: string, options?: {} }
router.post('/', async (req, res) => {
  const { provider, input, model, options } = req.body || {};

  if (!provider || !input) {
    return res.status(400).json({ error: 'provider and input are required' });
  }

  try {
    if (provider === 'openai') {
      const payload = {
        model: model || process.env.OPENAI_DEFAULT_MODEL || 'gpt-5-mini',
        messages: [{ role: 'user', content: input }],
        ...(options || {})
      };

      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      const data = await r.json();
      return res.status(r.status).json(data);

    } else if (provider === 'anthropic') {
      const payload = {
        model: model || process.env.ANTHROPIC_DEFAULT_MODEL || 'claude-haiku-4.5',
        prompt: input,
        ...(options || {})
      };

      const r = await fetch('https://api.anthropic.com/v1/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY
        },
        body: JSON.stringify(payload)
      });

      const data = await r.json();
      return res.status(r.status).json(data);

    } else {
      return res.status(400).json({ error: 'Unknown provider' });
    }
  } catch (err) {
    console.error('AI proxy error:', err);
    return res.status(500).json({ error: 'AI proxy request failed', detail: err.message });
  }
});

module.exports = router;
