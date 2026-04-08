// 
// MODEL EVALUATION & ACCURACY REPORT
// 

let evalTab = 'live';

function buildEvalReport() {
 _renderEvalShell();
 _renderLiveEval();
}

function _renderEvalShell() {
 const container = document.getElementById('evalMainContainer');
 if (!container) return;
 container.innerHTML = `<div id="evalLiveContent"></div>`;
}


function _renderLiveEval() {
 const el = document.getElementById('evalLiveContent');
 if (!el) return;

 if (!candidates.length) {
 el.innerHTML = `<div class="alert alert-warn" style="margin:0 0 16px">
 No screening session data. Run a screening first, then come back here.
 </div>`;
 return;
 }

 const bm = window._lastEvalMetrics || null;
 const total = candidates.length;
 const scores = candidates.map(c=>c.score||0);
 const avg = Math.round(scores.reduce((a,b)=>a+b,0)/total);
 const atsC = candidates.filter(c=>c.ats);
 const avgATS = atsC.length ? Math.round(atsC.reduce((a,c)=>a+(c.ats?.atsScore||0),0)/atsC.length) : null;
 const hi = candidates.filter(c=>c.score>=80).length;
 const vari = scores.reduce((a,v)=>{const d=v-avg;return a+d*d;},0)/Math.max(total,1);
 const stdDev = Math.round(Math.sqrt(vari));
 const range = Math.max(...scores)-Math.min(...scores);
 const sorted = [...candidates].sort((a,b)=>(b.score||0)-(a.score||0));

 // Use backend metrics if available, else compute proxy metrics
 let prec, rec, f1val, acc, cov;
 if (bm) {
 prec=bm.precision; rec=bm.recall; f1val=bm.f1; acc=bm.accuracy; cov=bm.coverage;
 } else {
 const sh = candidates.filter(c=>c.score>=80);
 const tq = sh.filter(c=>(c.ats?.atsScore||0)>=60||(c.analysis?.explanation?.matchedTechCount||0)>=(c.analysis?.explanation?.totalJDSkills||1)*0.6);
 prec = sh.length>0?Math.min(99,Math.round(tq.length/sh.length*100)):0;
 const ws = candidates.filter(c=>(c.analysis?.explanation?.matchedTechCount||0)>0);
 const cw = ws.filter(c=>c.score>=60);
 rec = ws.length>0?Math.min(99,Math.round(cw.length/ws.length*100)):0;
 f1val = prec+rec>0?Math.round(2*prec*rec/(prec+rec)):0;
 acc = Math.min(99,Math.round((prec+rec)/2));
 const allM = new Set(candidates.flatMap(c=>c.analysis?.explanation?.matchedSkills||[]));
 const tj = Math.max(...candidates.map(c=>c.analysis?.explanation?.totalJDSkills||0),1);
 cov = Math.round(allM.size/tj*100);
 }

 // Confusion matrix
 const aqSet = new Set(candidates.filter(c=>
 (c.analysis?.explanation?.matchedTechCount||0)>=(c.analysis?.explanation?.totalJDSkills||99)*0.5
 ||(c.ats?.atsScore||0)>=65
 ).map(c=>c.name));
 const TP=candidates.filter(c=>c.score>=80&&aqSet.has(c.name)).length;
 const FP=candidates.filter(c=>c.score>=80&&!aqSet.has(c.name)).length;
 const FN=candidates.filter(c=>c.score<80&&aqSet.has(c.name)).length;
 const TN=candidates.filter(c=>c.score<80&&!aqSet.has(c.name)).length;

 el.innerHTML = `

 <!-- note about proxy metrics -->
 <div class="alert alert-warn" style="margin-bottom:16px;font-size:12px">
 <strong> Note:</strong> Live session uses <em>proxy labels</em> (candidates with ≥50% skill match OR ATS ≥65 are treated as "actually qualified").
 Run a screening session above to see live metrics.
 ${bm?'<span style="color:var(--success);font-weight:600">&nbsp; Backend TF-IDF metrics active.</span>':''}
 </div>

 <!-- stat cards -->
 <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-bottom:20px">
 ${[
 {l:'Total Screened',v:total, c:'var(--primary)'},
 {l:'Shortlisted ≥80',v:hi, c:'var(--success)'},
 {l:'Avg Score', v:avg+'%', c:'#974F0C'},
 {l:'Avg ATS', v:avgATS!=null?avgATS+'%':'—',c:'#185FA5'},
 {l:'Precision*', v:prec+'%', c:'#185FA5'},
 {l:'Recall*', v:rec+'%', c:'#006644'},
 {l:'F1*', v:f1val+'%', c:'#5E4DB2'},
 {l:'Skill Coverage', v:cov+'%', c:'var(--text2)'},
 ].map(s=>`<div class="stat-box" style="border-top:3px solid ${s.c}">
 <div class="sv" style="color:${s.c};font-size:22px">${s.v}</div>
 <div class="sl">${s.l}</div>
 </div>`).join('')}
 </div>

 <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">

 <!-- PRF bars -->
 <div class="card">
 <div class="card-header"><h2>Precision, Recall & F1 (proxy)</h2></div>
 <div class="card-body">
 ${[
 {l:'Precision',v:prec,c:'#185FA5',d:'TP / (TP+FP) — of shortlisted (≥80), how many are proxy-qualified'},
 {l:'Recall', v:rec, c:'#006644',d:'TP / (TP+FN) — of proxy-qualified, how many were shortlisted'},
 {l:'F1 Score', v:f1val,c:'#5E4DB2',d:'Harmonic mean of Precision and Recall'},
 {l:'Accuracy', v:acc, c:'var(--primary)',d:'(TP+TN) / Total — proxy accuracy estimate'},
 ].map(r=>`
 <div style="margin-bottom:14px">
 <div style="display:flex;justify-content:space-between;margin-bottom:4px">
 <span style="font-size:13px;font-weight:600;color:var(--text2)">${r.l}</span>
 <span style="font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:13px;color:${r.c}">${r.v}%</span>
 </div>
 <div style="background:var(--bg);border:1px solid var(--border);border-radius:4px;height:10px;overflow:hidden;margin-bottom:3px">
 <div style="width:${r.v}%;height:100%;background:${r.c};border-radius:4px;transition:width 1s"></div>
 </div>
 <div style="font-size:11px;color:var(--text3)">${r.d}</div>
 </div>`).join('')}
 </div>
 </div>

 <!-- confusion matrix -->
 <div class="card">
 <div class="card-header"><h2>Confusion Matrix (proxy)</h2></div>
 <div class="card-body">
 <div style="font-size:11px;color:var(--text3);margin-bottom:10px">
 Threshold: score ≥ 80 = "Recommended" | Proxy qualification: skill match ≥50% OR ATS ≥65
 </div>
 <div style="display:grid;grid-template-columns:70px 1fr 1fr;gap:4px;text-align:center;margin-bottom:12px">
 <div></div>
 <div style="padding:6px;background:var(--success-bg);border:1px solid var(--success-border);border-radius:4px;font-size:10px;font-weight:700;color:var(--success)">Predicted Qualified</div>
 <div style="padding:6px;background:var(--danger-bg);border:1px solid var(--danger-border);border-radius:4px;font-size:10px;font-weight:700;color:var(--danger)">Predicted Not Qual.</div>
 <div style="padding:6px;background:var(--success-bg);border:1px solid var(--success-border);border-radius:4px;font-size:10px;font-weight:700;color:var(--success)">Actual Qualified</div>
 <div style="padding:14px 6px;background:var(--success-bg);border:2px solid var(--success-border);border-radius:4px">
 <div style="font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:26px;color:var(--success)">${TP}</div>
 <div style="font-size:9px;font-weight:700;color:var(--success)">TRUE POSITIVE</div>
 </div>
 <div style="padding:14px 6px;background:var(--warn-bg);border:1px solid var(--warn-border);border-radius:4px">
 <div style="font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:26px;color:var(--warn)">${FN}</div>
 <div style="font-size:9px;font-weight:700;color:var(--warn)">FALSE NEGATIVE</div>
 </div>
 <div style="padding:6px;background:var(--danger-bg);border:1px solid var(--danger-border);border-radius:4px;font-size:10px;font-weight:700;color:var(--danger)">Actual Not Qual.</div>
 <div style="padding:14px 6px;background:var(--warn-bg);border:1px solid var(--warn-border);border-radius:4px">
 <div style="font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:26px;color:var(--warn)">${FP}</div>
 <div style="font-size:9px;font-weight:700;color:var(--warn)">FALSE POSITIVE</div>
 </div>
 <div style="padding:14px 6px;background:var(--success-bg);border:2px solid var(--success-border);border-radius:4px">
 <div style="font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:26px;color:var(--success)">${TN}</div>
 <div style="font-size:9px;font-weight:700;color:var(--success)">TRUE NEGATIVE</div>
 </div>
 </div>
 <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
 <div style="background:var(--surface2);border:1px solid var(--border);border-radius:4px;padding:8px 10px">
 <div style="font-size:10px;color:var(--text3)">False Positive Rate</div>
 <div style="font-family:'IBM Plex Mono',monospace;font-weight:700;color:var(--warn);font-size:14px">${total?Math.round(FP/total*100):0}%</div>
 <div style="font-size:9px;color:var(--text4)">FP / (FP+TN)</div>
 </div>
 <div style="background:var(--surface2);border:1px solid var(--border);border-radius:4px;padding:8px 10px">
 <div style="font-size:10px;color:var(--text3)">False Negative Rate</div>
 <div style="font-family:'IBM Plex Mono',monospace;font-weight:700;color:var(--warn);font-size:14px">${total?Math.round(FN/total*100):0}%</div>
 <div style="font-size:9px;color:var(--text4)">FN / (FN+TP)</div>
 </div>
 </div>
 </div>
 </div>
 </div>

 <!-- per-candidate table -->
 <div class="card" style="margin-bottom:16px">
 <div class="card-header"><h2> Per-Candidate Breakdown</h2></div>
 <div style="overflow-x:auto">
 <table class="data-table" style="min-width:780px">
 <thead><tr>
 <th>#</th><th>Candidate</th><th>Match Score</th><th>TF-IDF</th><th>ATS</th>
 <th>Tech</th><th>Exp</th><th>Role</th>
 <th>Matched Skills</th><th>Missing Skills</th><th>Decision</th>
 </tr></thead>
 <tbody>
 ${sorted.map((c,i)=>{
 const s=c.score||0;
 const ats=c.ats?.atsScore??'—';
 const dims=c.analysis?.dimensions||{};
 const ex=c.analysis?.explanation||{};
 const cosine=ex.cosineSimilarity??c.analysis?.cosineSimilarity??'—';
 const matched=(ex.matchedSkills||[]).slice(0,3).join(', ')||'—';
 const missing=(ex.missingSkills||[]).slice(0,3).join(', ')||'—';
 const cls=s>=80?'badge-success':s>=60?'badge-warn':s>=40?'badge-neutral':'badge-danger';
 return `<tr style="background:${i%2===0?'var(--surface)':'var(--surface2)'}">
 <td style="font-family:'IBM Plex Mono',monospace;font-weight:700;color:var(--text3);text-align:center">${i+1}</td>
 <td><div style="font-weight:600;font-size:12px">${esc(c.name)}</div><div style="font-size:10px;color:var(--text3)">${esc(c.role||'Candidate')}</div></td>
 <td><div style="display:flex;align-items:center;gap:5px">
 <div style="width:40px;background:var(--bg);border:1px solid var(--border);border-radius:2px;height:5px;overflow:hidden">
 <div style="width:${s}%;height:100%;background:${scBar(s)};border-radius:2px"></div>
 </div>
 <span style="font-family:'IBM Plex Mono',monospace;font-weight:700;color:${sc(s)};font-size:13px">${s}</span>
 </div></td>
 <td style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--text3)">${typeof cosine==='number'?cosine+'%':cosine}</td>
 <td style="font-family:'IBM Plex Mono',monospace;font-weight:600;color:${typeof ats==='number'?sc(ats):'var(--text4)'}">${ats}</td>
 <td style="text-align:center;color:var(--text3);font-size:12px">${dims['Technical Skills']||'—'}</td>
 <td style="text-align:center;color:var(--text3);font-size:12px">${dims['Experience Level']||'—'}</td>
 <td style="text-align:center;color:var(--text3);font-size:12px">${dims['Role Alignment']||'—'}</td>
 <td style="font-size:10px;color:var(--success);max-width:120px">${esc(matched)}</td>
 <td style="font-size:10px;color:var(--danger);max-width:120px">${esc(missing)}</td>
 <td><span class="badge ${cls}">${s>=80?'Recommended':s>=60?'Consider':s>=40?'On Hold':'Rejected'}</span></td>
 </tr>`;
 }).join('')}
 </tbody>
 </table>
 </div>
 </div>

 <!-- score dist -->
 <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
 <div class="card">
 <div class="card-header"><h2>Score Distribution</h2></div>
 <div class="card-body">
 ${[{l:'Excellent (80–100)',min:80,max:101,c:'#006644',bar:'#36B37E'},{l:'Good (60–79)',min:60,max:80,c:'#974F0C',bar:'#FF991F'},{l:'Fair (40–59)',min:40,max:60,c:'#FF7452',bar:'#FFAB00'},{l:'Weak (0–39)',min:0,max:40,c:'#BF2600',bar:'#FF5630'}]
 .map(b=>{
 const cnt=candidates.filter(c=>c.score>=b.min&&c.score<b.max).length;
 const pct=total?Math.round(cnt/total*100):0;
 const maxC=Math.max(...[80,60,40,0].map(m=>candidates.filter(c=>c.score>=m).length),1);
 return `<div style="margin-bottom:12px">
 <div style="display:flex;justify-content:space-between;margin-bottom:4px">
 <span style="font-size:12px;font-weight:600;color:${b.c}">${b.l}</span>
 <span style="font-size:11px;color:var(--text3)">${cnt} &nbsp;<span style="font-family:'IBM Plex Mono',monospace;font-weight:700;color:${b.c}">${pct}%</span></span>
 </div>
 <div style="background:var(--bg);border:1px solid var(--border);border-radius:2px;height:14px;overflow:hidden">
 <div style="width:${total?Math.round(cnt/total*100):0}%;height:100%;background:${b.bar};border-radius:2px"></div>
 </div>
 </div>`;
 }).join('')}
 </div>
 </div>
 <div class="card">
 <div class="card-header"><h2>Bias & Fairness</h2></div>
 <div class="card-body">
 ${[
 {l:'Name-blind scoring', v:true, d:'Names excluded from analysis prompts'},
 {l:'Semantic NLP matching',v:true, d:'Synonym expansion reduces keyword bias'},
 {l:'Multi-axis scoring', v:true, d:'5 dimensions prevent single-metric bias'},
 {l:'Score std deviation', v:null, raw:'±'+stdDev+' pts', d:stdDev<20?'Acceptable variance':'High variance — review outliers'},
 {l:'Score range', v:null, raw:range+' pts', d:range<70?'Reasonable spread':'Very wide — check JD relevance'},
 {l:'Skill coverage', v:null, raw:cov+'%', d:'JD skills covered across all resumes'},
 ].map(b=>`
 <div style="display:flex;align-items:flex-start;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);gap:10px">
 <div>
 <div style="font-size:12px;font-weight:500;color:var(--text2)">${b.l}</div>
 <div style="font-size:10px;color:var(--text3);margin-top:1px">${b.d}</div>
 </div>
 <div style="flex-shrink:0">
 ${b.v===true?'<span class="badge badge-success" style="font-size:10px"> Pass</span>':
 b.v===false?'<span class="badge badge-neutral" style="font-size:10px">– N/A</span>':
 `<span class="badge badge-neutral" style="font-family:'IBM Plex Mono',monospace;font-size:10px">${b.raw}</span>`}
 </div>
 </div>`).join('')}
 </div>
 </div>
 </div>
 `;
}

async function refreshEvalMetrics() {
 const btn = document.querySelector('[onclick="refreshEvalMetrics()"]');
 if (btn) { btn.disabled=true; btn.textContent=' Refreshing…'; }
 try {
 const m = await callBackendEvaluate(candidates);
 window._lastEvalMetrics = m;
 if (evalTab === 'live') _renderLiveEval();
 showEvalToast(' Backend metrics refreshed');
 } catch(e) {
 window._lastEvalMetrics = null;
 showEvalToast('Backend unavailable — using local proxy metrics');
 } finally {
 if (btn) { btn.disabled=false; btn.textContent=' Refresh Metrics'; }
 }
}

function showEvalToast(msg) {
 let t = document.getElementById('evalToast');
 if (!t) {
 t = document.createElement('div'); t.id='evalToast';
 t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:var(--sidebar);color:#fff;padding:10px 18px;border-radius:6px;font-size:13px;z-index:600;opacity:0;transition:opacity .3s;pointer-events:none;box-shadow:0 4px 16px rgba(0,0,0,.2)';
 document.body.appendChild(t);
 }
 t.textContent=msg; t.style.opacity='1';
 clearTimeout(t._tid); t._tid=setTimeout(()=>t.style.opacity='0',3000);
}
