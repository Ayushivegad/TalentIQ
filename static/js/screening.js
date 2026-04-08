// SCREENING 

async function runScreening(){
 const jd=document.getElementById('jdArea').value.trim();
 if(!jd){showError('Please enter a job description.');return;}
 if(!resumes.length){showError('Please add at least one resume.');return;}
 if(appMode==='live'){
 const apiKey=document.getElementById('apiKey')?.value.trim();
 if(!apiKey){showError('Please enter your API key, or switch to Demo Mode.');return;}
 }
 hideError();
 running=true; candidates=[]; selCand=null;
 gotoTab('screening');
 document.getElementById('demoBanner').style.display=appMode==='demo'?'block':'none';
 document.getElementById('atsLbl').style.display=enableATS?'inline':'none';
 document.getElementById('scCards').innerHTML='';
 document.getElementById('logLines').innerHTML='';
 const cb=document.getElementById('completionBanner');
 if(cb) cb.style.display='none';

 addLog('Screening started');
 addLog(`JD: ${jd.split(' ').length} words`);
 addLog(`${resumes.length} resumes | ATS: ${enableATS?'ON':'OFF'} | Mode: ${appMode}`);

 const total=resumes.length;
 for(let i=0;i<resumes.length;i++){
 const r=resumes[i];
 setPg(i+1,total,`Analysing ${r.name}…`);
 addLog(`Analysing: ${r.name}${r.fileName?` [${r.fileName}]`:''}`);
 const cand={...r,score:null,loading:true,atsLoading:enableATS,analysis:{},ats:null};
 candidates.push(cand);
 appendScCard(cand,i);

 if(appMode==='demo'){
 // Try backend TF-IDF engine first, fall back to frontend rule engine
 let result;
 try{
 await sleep(300+Math.random()*200);
 addLog(`Using backend TF-IDF engine for ${r.name}…`);
 const backendResult=await callBackendScore(r.text, r.name, jd);
 result=backendResult;
 addLog(` Backend TF-IDF: ${r.name} → ${result.match.score}/100 (cosine: ${result.match.cosineSimilarity||'—'})`);
 }catch(e){
 addLog(`Backend unavailable (${e.message}), using frontend engine`);
 await sleep(400+Math.random()*300);
 result=demoAnalyze(r.text,r.name,jd);
 addLog(`Match: ${r.name} → ${result.match.score}/100`);
 }
 cand.score=result.match.score;
 cand.loading=false;
 cand.analysis=result.match;
 updateScCard(cand,i);

 if(enableATS){
 await sleep(200+Math.random()*150);
 cand.ats=result.ats;
 cand.atsLoading=false;
 addLog(`ATS: ${r.name} → ${result.ats.atsScore}/100`);
 updateScCard(cand,i);
 } else {
 cand.atsLoading=false;
 }

 } else {
 // LIVE mode — Claude AI
 const apiKey=document.getElementById('apiKey')?.value.trim();
 try{
 const sys=`You are an expert HR analyst. Analyse the resume against the job description and return a JSON object.

IMPORTANT: Return ONLY the raw JSON object. No markdown, no code fences, no explanation text before or after.

Required JSON structure:
{"score": <integer 0-100>, "dimensions": {"Technical Skills": <0-100>, "Experience Level": <0-100>, "Role Alignment": <0-100>, "Leadership & Soft Skills": <0-100>}, "strengths": ["Matched skills: ...", "..."], "gaps": ["Missing skills: ...", "..."], "recommendation": "<2-3 sentence summary>", "explanation": {"matchedSkills": [], "missingSkills": [], "matchedKeywords": [], "missingKeywords": [], "experienceYears": <number>, "requiredYears": <number>, "totalJDSkills": <number>, "matchedTechCount": <number>}}

Return ONLY JSON. No text before or after.`;
 const raw=await callAI(apiKey,sys,`JOB DESCRIPTION:\n${jd}\n\nRESUME (${r.name}):\n${r.text}`);
 const parsed=parseJSON(raw);
 // Robust score extraction
        const score = (parsed && typeof parsed.score === 'number' && parsed.score > 0) 
          ? Math.round(parsed.score) 
          : (parsed?.score ?? null);
        if (!parsed || score === null) {
          addLog(`⚠ Could not parse AI response for ${r.name}. Raw: ${raw?.substring(0,100)}`);
        }
        const finalScore = score ?? 50;
 // Augment with local TF-IDF parse for cosine similarity + structured data
 let localResult;
 try{ localResult=await callBackendScore(r.text,r.name,jd); }
 catch(e){ localResult=demoAnalyze(r.text,r.name,jd); }
 const mergedAnalysis={
 ...parsed,
 cosineSimilarity: localResult.match.cosineSimilarity||null,
 parsedResume: localResult.match.parsedResume||parsed?.parsedResume,
 explanation: parsed?.explanation||localResult.match.explanation,
 dimensions: {...(parsed?.dimensions||{}), "TF-IDF Similarity": localResult.match.cosineSimilarity||null},
 };
 cand.score=finalScore; cand.loading=false; cand.analysis=mergedAnalysis;
 addLog(`Match: ${r.name} → ${finalScore}/100`); updateScCard(cand,i);
    }catch(e){
        addLog(`AI error for ${r.name}: ${e.message} — using local engine as fallback`);
        try {
          let fallback;
          try { fallback = await callBackendScore(r.text, r.name, jd); }
          catch(e2) { fallback = demoAnalyze(r.text, r.name, jd); }
          cand.score = fallback.match.score;
          cand.analysis = fallback.match;
          addLog(`Fallback score: ${r.name} → ${fallback.match.score}/100`);
        } catch(e3) {
          cand.score = 30; // give a non-zero default instead of 0
        }
        cand.loading = false;
        updateScCard(cand, i);
      }

 if(enableATS){
 try{
 addLog(`ATS: ${r.name}…`);
 const atsSys=`You are an ATS compatibility expert. Evaluate the resume for ATS compatibility.

IMPORTANT: Return ONLY the raw JSON object. No markdown, no code fences, no text before or after.

Required JSON structure:
{"atsScore": <0-100>, "summary": "<1-2 sentence summary>", "subScores": {"Keyword Optimization": <0-100>, "Formatting & Structure": <0-100>, "Section Completeness": <0-100>, "Readability": <0-100>, "Contact Info": <0-100>}, "sections": {"Contact Information": <true or false>, "Professional Summary": <true or false>, "Work Experience": <true or false>, "Education": <true or false>, "Skills Section": <true or false>, "Certifications / Achievements": <true or false>}, "keywordMatchPct": <0-100>, "keywords": {"matched": [], "missing": []}, "formattingIssues": [], "improvements": []}

Return ONLY JSON. No text before or after.`;
 const atsRaw=await callAI(apiKey,atsSys,`JOB DESCRIPTION:\n${jd}\n\nRESUME (${r.name}):\n${r.text}`,1400);
 const ats=parseJSON(atsRaw)||{atsScore:50,summary:'Analysis incomplete.',subScores:{},sections:{},keywords:{matched:[],missing:[]},formattingIssues:[],improvements:[]};
 cand.ats=ats; cand.atsLoading=false;
 addLog(`ATS: ${r.name} → ${ats.atsScore}/100`); updateScCard(cand,i);
 }catch(e){
 addLog(`ATS error: ${r.name}`); cand.atsLoading=false; updateScCard(cand,i);
 }
 } else { cand.atsLoading=false; }
 await sleep(300);
 }
 }

 addLog('Ranking by score…'); await sleep(200);
 candidates.sort((a,b)=>(b.score??0)-(a.score??0));
 addLog(`Completed. Top candidate: ${candidates[0]?.name||'—'} (${candidates[0]?.score||0}/100)`);
 setPg(total,total,'Analysis complete');
 running=false;
 document.getElementById('tnav-screening').classList.add('done');

 // Push candidates to backend for evaluation metrics
 try{
 const metrics=await callBackendEvaluate(candidates);
 window._lastEvalMetrics=metrics;
 addLog(`Eval metrics computed: F1=${metrics.f1}% Precision=${metrics.precision}% Recall=${metrics.recall}%`);
 }catch(e){ /* non-critical */ }

 renderResults();
 if(cb) cb.style.display='flex';
}

function setPg(cur,tot,lbl){
 document.getElementById('pgLabel').textContent=lbl;
 document.getElementById('pgCount').textContent=`${cur} / ${tot}`;
 document.getElementById('pgFill').style.width=tot?`${(cur/tot)*100}%`:'0%';
}

function addLog(msg){
 const el=document.getElementById('logLines');
 el.innerHTML+=`<div style="display:flex;gap:10px;margin-bottom:2px">
 <span style="color:rgba(255,255,255,.25);font-size:10px;flex-shrink:0">${new Date().toLocaleTimeString()}</span>
 <span style="color:rgba(255,255,255,.55);font-size:11px">${esc(msg)}</span></div>`;
 const logBox=document.getElementById('logBox');
 if(logBox) logBox.scrollTop=9999;
 el.parentElement.scrollTop=9999;
}

function appendScCard(c,i){
 const el=document.getElementById('scCards');
 const div=document.createElement('div');div.id=`sc${i}`;div.className='sc-card';
 div.innerHTML=`<div id="sci${i}" class="spinner"></div>
 <div style="flex:1">
 <div style="font-weight:600;font-size:13px;color:var(--text)">${esc(c.name)}</div>
 <div id="scb${i}" style="color:var(--text3);font-size:11px;margin-top:4px">Analysing match score…</div>
 </div>
 <div id="scs${i}" style="font-family:'IBM Plex Mono',monospace;font-size:20px;font-weight:700;color:var(--text4)">—</div>`;
 el.appendChild(div);
}

function updateScCard(c,i){
 const score=c.score??null;
 const spinner=document.getElementById(`sci${i}`);
 const scoreEl=document.getElementById(`scs${i}`);
 const bodyEl=document.getElementById(`scb${i}`);
 if(spinner) spinner.style.display=c.loading?'block':'none';
 if(scoreEl){
 if(score!==null){scoreEl.textContent=score;scoreEl.style.color=sc(score);}
 else scoreEl.textContent='—';
 }
 if(bodyEl){
 const cosine=c.analysis?.cosineSimilarity;
 if(!c.loading && score!==null){
 bodyEl.innerHTML=`<span style="color:${sc(score)};font-weight:600">${sl(score)}</span>${cosine!=null?` &nbsp;<span style="color:var(--text4);font-size:10px">TF-IDF: ${cosine}</span>`:''}${c.atsLoading?' &nbsp;<span style="color:var(--text4)">ATS…</span>':c.ats?` &nbsp;ATS: <span style="color:${sc(c.ats.atsScore)};font-weight:600">${c.ats.atsScore}</span>`:''}`;
 }
 }
}
