// INIT
window.onload = async () => {
 // hide non-setup pages
 ['screening','results','report'].forEach(x=>{
 const pg=document.getElementById('page-'+x);
 if(pg){pg.classList.remove('active');pg.style.cssText='display:none';}
 });
 document.getElementById('jdArea').value = SAMPLE_JD;
 resumes = SAMPLE_RESUMES.map((r,i)=>({...r,id:i}));
 updateJDStats(); renderResumeList();

 // Check auth status and backend capabilities in parallel
 await Promise.all([checkAuth(), detectBackend()]);
};

function updateJDStats(){
 const t = document.getElementById('jdArea').value;
 document.getElementById('jdWords').textContent = t.split(/\s+/).filter(Boolean).length;
 document.getElementById('jdBullets').textContent = (t.match(/[•\-\*]/g)||[]).length;
}

// ── Multi-provider API key badge ──
(function(){
  const input = document.getElementById('apiKey');
  const badge = document.getElementById('apiBadge');
  if (!input || !badge) return;
  input.addEventListener('input', function(){
    const v = this.value.trim();
    if (!v) { badge.textContent = ''; return; }
    if (v.startsWith('sk-ant-'))           badge.innerHTML = '🟣 Claude (Anthropic)';
    else if (v.startsWith('sk-') || v.startsWith('sk-proj-')) badge.innerHTML = '🟢 OpenAI (GPT-4o-mini)';
    else                                    badge.innerHTML = '🔵 Google Gemini';
  });
})();

// ── Provider UI updater ──
function updateProviderUI() {
  const provider = document.getElementById('aiProvider')?.value;
  const keyInput  = document.getElementById('apiKey');
  const keyLink   = document.getElementById('getKeyLink');
  if (!provider || !keyInput) return;

  const cfg = {
    claude: {
      placeholder: 'sk-ant-…',
      label: 'Get Claude key →',
      href: 'https://console.anthropic.com'
    },
    openai: {
      placeholder: 'sk-…',
      label: 'Get OpenAI key →',
      href: 'https://platform.openai.com/api-keys'
    },
    gemini: {
      placeholder: 'AIza…',
      label: 'Get Gemini key →',
      href: 'https://aistudio.google.com/app/apikey'
    }
  };

  const c = cfg[provider];
  keyInput.placeholder = c.placeholder;
  if (keyLink) { keyLink.textContent = c.label; keyLink.href = c.href; }
}

// run once on load
document.addEventListener('DOMContentLoaded', updateProviderUI);
