// RESULTS 
function renderResults(){
 const avg=candidates.length?Math.round(candidates.reduce((a,c)=>a+(c.score||0),0)/candidates.length):0;
 const atsC=candidates.filter(c=>c.ats);
 const avgATS=atsC.length?Math.round(atsC.reduce((a,c)=>a+(c.ats?.atsScore||0),0)/atsC.length):'—';
 const stats=[
 {l:'Screened',v:candidates.length,c:'var(--primary)',bg:'var(--info-bg)'},
 {l:'Strong Match ≥80',v:candidates.filter(c=>c.score>=80).length,c:'var(--success)',bg:'var(--success-bg)'},
 {l:'Avg Match Score',v:avg+'%',c:'var(--warn)',bg:'var(--warn-bg)'},
 {l:'ATS Friendly ≥80',v:candidates.filter(c=>c.ats?.atsScore>=80).length,c:'var(--success)',bg:'var(--success-bg)'},
 {l:'Avg ATS Score',v:avgATS+(typeof avgATS==='number'?'%':''),c:'var(--warn)',bg:'var(--warn-bg)'},
 ];
 document.getElementById('statsRow').innerHTML=stats.map(s=>`
 <div class="stat-box" style="border-top:3px solid ${s.c}">
 <div class="sv" style="color:${s.c}">${s.v}</div>
 <div class="sl">${s.l}</div>
 </div>
 `).join('')
 + (appMode==='demo'?`<div class="stat-box" style="border-top:3px solid var(--primary);display:flex;flex-direction:column;justify-content:center">
 <div style="font-size:11px;font-weight:700;color:var(--primary)"> DEMO MODE</div>
 <div style="font-size:11px;color:var(--text3);margin-top:3px;line-height:1.4">Simulated results. Switch to Live for real AI screening.</div>
 </div>`:'');
 filterCandidates();
}

// FILTER & SEARCH 
function filterCandidates(){
 const query=(document.getElementById('candidateSearch')?.value||'').toLowerCase().trim();
 const scoreFilter=document.getElementById('filterScore')?.value||'all';
 const sortMode=document.getElementById('filterSort')?.value||'score';

 let filtered=[...candidates];

 // Search filter
 if(query){
 filtered=filtered.filter(c=>{
 const nameMatch=c.name.toLowerCase().includes(query);
 const roleMatch=(c.role||'').toLowerCase().includes(query);
 const skillMatch=(c.analysis?.explanation?.matchedSkills||[]).some(s=>s.toLowerCase().includes(query));
 const allSkillMatch=(c.analysis?.parsedResume?.skills||[]).some(s=>s.toLowerCase().includes(query));
 return nameMatch||roleMatch||skillMatch||allSkillMatch;
 });
 }

 // Score filter
 if(scoreFilter!=='all'){
 filtered=filtered.filter(c=>{
 const s=c.score??0;
 if(scoreFilter==='excellent') return s>=80;
 if(scoreFilter==='good') return s>=60&&s<80;
 if(scoreFilter==='fair') return s>=40&&s<60;
 if(scoreFilter==='weak') return s<40;
 return true;
 });
 }

 // Sort
 if(sortMode==='score') filtered.sort((a,b)=>(b.score??0)-(a.score??0));
 else if(sortMode==='name') filtered.sort((a,b)=>a.name.localeCompare(b.name));
 else if(sortMode==='ats') filtered.sort((a,b)=>(b.ats?.atsScore??-1)-(a.ats?.atsScore??-1));

 // Filter info
 const info=document.getElementById('filterInfo');
 if(info){
 if(query||scoreFilter!=='all'){
 info.style.display='block';
 info.textContent=`Showing ${filtered.length} of ${candidates.length} candidates${query?` matching "${query}"`:''}`;
 } else {
 info.style.display='none';
 }
 }

 renderRankList(filtered);
}

function renderRankList(list){
 const items=list||candidates;
 document.getElementById('rankList').innerHTML=items.map((c,i)=>ccHTML(c,i,candidates.indexOf(c))).join('');
 if(items.length===0){
 document.getElementById('rankList').innerHTML=`<div style="text-align:center;padding:24px;color:var(--text4);font-size:13px">No candidates match your filter.</div>`;
 }
}

function ccHTML(c,i,origIdx){
 const score=c.score??0,col=sc(score),isS=selCand?.name===c.name;
 const atsScore=c.ats?.atsScore??null;
 const matchedSkills=(c.analysis?.explanation?.matchedSkills||[]).slice(0,3);
 const missingSkills=(c.analysis?.explanation?.missingSkills||[]).slice(0,2);
 return `<div onclick="selectCand(${origIdx})" class="cand-row${isS?' selected':''}">
 <div class="rank-badge" style="background:${scBg(score)};color:${col};border:1px solid ${scBd(score)}">#${i+1}</div>
 <div class="avatar" style="background:${avatarColor(c.name)};color:#fff;font-size:12px">${c.name.trim().charAt(0).toUpperCase()}</div>
 <div style="flex:1;min-width:0">
 <div style="font-weight:600;font-size:13px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(c.name)}</div>
 <div style="font-size:11px;color:var(--text3);margin-bottom:4px;display:flex;align-items:center;gap:5px">
 ${c.source==='file'?`<span class="badge badge-info" style="font-size:9px;padding:1px 5px">${(c.fileType||'').toUpperCase()}</span>`:''}
 <span>${esc(c.role||'Candidate')}</span>
 </div>
 <!-- Inline skill tags -->
 ${matchedSkills.length>0?`<div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:4px">
 ${matchedSkills.map(s=>`<span style="background:var(--success-bg);color:var(--success);border:1px solid var(--success-border);border-radius:8px;padding:1px 6px;font-size:10px"> ${esc(s)}</span>`).join('')}
 ${missingSkills.map(s=>`<span style="background:var(--danger-bg);color:var(--danger);border:1px solid var(--danger-border);border-radius:8px;padding:1px 6px;font-size:10px"> ${esc(s)}</span>`).join('')}
 </div>`:''}
 <div style="display:flex;gap:8px;align-items:center">
 <div style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:3px;height:6px;overflow:hidden"><div style="width:${score}%;height:100%;background:${scBar(score)};border-radius:3px"></div></div>
 ${atsScore!=null?`<span style="font-size:10px;color:var(--text3);flex-shrink:0">ATS <span style="color:${sc(atsScore)};font-weight:700">${atsScore}</span></span>`:''}
 </div>
 </div>
 <div style="text-align:right;flex-shrink:0">
 <div style="color:${col};font-weight:700;font-size:22px;font-family:'IBM Plex Mono',monospace;line-height:1">${score}</div>
 <div style="font-size:10px;font-weight:600;color:${col};text-transform:uppercase;letter-spacing:.04em;margin-top:2px">${sl(score)}</div>
 </div>
 </div>`;
}

function selectCand(i){
 selCand=candidates[i]; dTab='match';
 filterCandidates();
 document.getElementById('detailEmpty').style.display='none';
 document.getElementById('detailInner').style.display='block';
 const atsScore=selCand.ats?.atsScore;
 const badge=document.getElementById('atsBadge');
 if(atsScore!=null){badge.style.display='inline';badge.style.background=scBg(atsScore);badge.style.color=sc(atsScore);badge.style.border=`1px solid ${scBd(atsScore)}`;badge.textContent=atsScore;}
 else badge.style.display='none';
 showDetailTab('match');
}

function showDetailTab(t){
 dTab=t;
 ['match','explain','parsed','ats','resume'].forEach(x=>{
 const btn=document.getElementById('dtab-'+x);
 if(btn) btn.classList.toggle('active',x===t);
 });
 document.getElementById('pMatch').style.display=t==='match'?'block':'none';
 document.getElementById('pExplain').style.display=t==='explain'?'block':'none';
 document.getElementById('pParsed').style.display=t==='parsed'?'block':'none';
 document.getElementById('pATS').style.display=t==='ats'?'block':'none';
 document.getElementById('pResume').style.display=t==='resume'?'block':'none';
 if(t==='match') buildMatchPanel();
 if(t==='explain') buildExplainPanel();
 if(t==='parsed') buildParsedPanel();
 if(t==='ats') buildATSPanel();
 if(t==='resume') buildResumePanel();
}
