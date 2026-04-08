// API - Multi-Provider Support (Claude, Gemini, OpenAI)

// ── Detect which provider based on API key prefix ──
function detectProvider(apiKey) {
  if (!apiKey) return null;
  if (apiKey.startsWith('sk-ant-')) return 'claude';
  if (apiKey.startsWith('sk-') || apiKey.startsWith('sk-proj-')) return 'openai';
  // Gemini keys are typically 39-char alphanumeric starting with "AI"
  if (apiKey.startsWith('AI') || apiKey.length === 39) return 'gemini';
  // Fallback: try to guess from length
  return 'gemini'; // default fallback for unknown keys
}

// ── Master call function — reads provider from dropdown ──
async function callAI(apiKey, system, user, maxTokens=1200) {
  const provider = document.getElementById('aiProvider')?.value || detectProvider(apiKey);
  if (provider === 'openai')  return await callOpenAI(apiKey, system, user, maxTokens);
  if (provider === 'gemini')  return await callGemini(apiKey, system, user, maxTokens);
  return await callClaude(apiKey, system, user, maxTokens); // default: claude
}

// ── Claude (Anthropic) ──
async function callClaude(apiKey, system, user, maxTokens=1200){
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }]
    })
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `Claude API error ${res.status}`);
  }
  const d = await res.json();
  return d.content.map(b => b.text || '').join('');
}

// ── OpenAI (GPT-4o) ──
async function callOpenAI(apiKey, system, user, maxTokens=1200){
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user',   content: user   }
      ]
    })
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `OpenAI API error ${res.status}`);
  }
  const d = await res.json();
  return d.choices[0].message.content;
}

// ── Gemini (Google) ──
async function callGemini(apiKey, system, user, maxTokens=1200){
  const prompt = system ? `${system}\n\n${user}` : user;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens }
      })
    }
  );
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const msg = errBody?.error?.message || `Gemini API error ${res.status}`;
    throw new Error(msg);
  }
  const d = await res.json();
  return d.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// Call backend scoring engine (TF-IDF + rule-based)
async function callBackendScore(resumeText, resumeName, jobDescription){
 const r=await fetch('/api/score',{
 method:'POST',
 headers:{'Content-Type':'application/json'},
 body:JSON.stringify({resumeText,resumeName,jobDescription})
 });
 if(!r.ok) throw new Error(`Backend score error ${r.status}`);
 return r.json();
}

// Call backend evaluation metrics
async function callBackendEvaluate(candidates){
 const r=await fetch('/api/evaluate',{
 method:'POST',
 headers:{'Content-Type':'application/json'},
 body:JSON.stringify({candidates})
 });
 if(!r.ok) throw new Error(`Backend evaluate error ${r.status}`);
 return r.json();
}

function parseJSON(t){
  if (!t) return null;
  try {
    // Remove markdown code fences (Gemini often adds these)
    let cleaned = t
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();
    return JSON.parse(cleaned);
  } catch(e1) {
    // Try extracting JSON object from anywhere in the text
    try {
      const match = t.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
    } catch(e2) {}
    return null;
  }
}
