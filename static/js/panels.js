// MATCH PANEL 
function ring(score,size){
 const r=(size-8)/2,circ=2*Math.PI*r,color=scBar(score);
 return `<svg width="${size}" height="${size}" style="transform:rotate(-90deg);flex-shrink:0"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--border)" stroke-width="7"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(score/100)*circ} ${circ}"/><text x="${size/2}" y="${size/2}" text-anchor="middle" dominant-baseline="central" style="transform:rotate(90deg);transform-origin:${size/2}px ${size/2}px;fill:${sc(score)};font-size:${size*.22}px;font-weight:700;font-family:'IBM Plex Mono',monospace">${score}</text></svg>`;
}
function bar(v,color){return `<div style="background:var(--bg);border:1px solid var(--border);border-radius:3px;height:8px;overflow:hidden"><div style="width:${Math.max(0,Math.min(100,v))}%;height:100%;background:${color};border-radius:3px;transition:width 1s"></div></div>`;}

function buildMatchPanel(){
 const c=selCand;if(!c)return;
 const score=c.score??0,col=sc(score),bg=scBg(score),bd=scBd(score),a=c.analysis||{};
 document.getElementById('pMatch').innerHTML=`
 <div class="match-hero" style="background:${bg};border:1px solid ${bd};border-radius:8px;padding:16px;display:flex;align-items:center;gap:16px;margin-bottom:16px">
 ${ring(score,72)}
 <div>
 <div style="font-weight:700;font-size:16px;color:var(--text)">${esc(c.name)}</div>
 <div style="color:var(--text3);font-size:12px;margin-bottom:8px">${esc(c.role||'Candidate')}</div>
 <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center">
 <span class="badge" style="background:${bg};color:${col};border-color:${bd};font-size:11px">${score>=80?'Excellent Match':score>=60?'Good Match':score>=40?'Moderate Match':'Weak Match'}</span>
 ${(a.cosineSimilarity!=null)?`<span style="background:var(--info-bg);border:1px solid var(--primary-light2);border-radius:10px;padding:2px 8px;font-size:10px;font-weight:600;color:var(--primary)"> TF-IDF: ${a.cosineSimilarity}%</span>`:''}
 ${c.parsedViaBackend?`<span style="background:var(--success-bg);border:1px solid var(--success-border);border-radius:10px;padding:2px 8px;font-size:10px;font-weight:600;color:var(--success)">Backend Parsed</span>`:''}
 </div>
 </div>
 </div>
 ${a.dimensions?`
 <div class="section-label">Evaluation Dimensions</div>
 <div style="background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:14px;margin-bottom:16px">
 ${Object.entries(a.dimensions).map(([k,v])=>`
 <div style="margin-bottom:12px">
 <div style="display:flex;justify-content:space-between;margin-bottom:5px">
 <span style="font-size:13px;font-weight:500;color:var(--text2)">${esc(k)}</span>
 <span style="color:${sc(v)};font-weight:700;font-size:12px;font-family:'IBM Plex Mono',monospace">${v}/100</span>
 </div>
 ${bar(v,scBar(v))}
 </div>
 `).join('')}
 </div>`:''}
 ${(a.strengths||a.gaps)?`
 <div class="strengths-gaps-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
 ${a.strengths?`
 <div>
 <div class="section-label" style="color:var(--success)"> Strengths</div>
 <ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px">
 ${a.strengths.map(s=>`<li style="background:var(--success-bg);border:1px solid var(--success-border);border-radius:4px;padding:7px 10px;font-size:12px;color:var(--text2);line-height:1.5">${esc(s)}</li>`).join('')}
 </ul>
 </div>`:''}
 ${a.gaps?`
 <div>
 <div class="section-label" style="color:var(--danger)"> Gaps</div>
 <ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px">
 ${a.gaps.map(g=>`<li style="background:var(--danger-bg);border:1px solid var(--danger-border);border-radius:4px;padding:7px 10px;font-size:12px;color:var(--text2);line-height:1.5">${esc(g)}</li>`).join('')}
 </ul>
 </div>`:''}
 </div>`:''}
 ${a.recommendation?`
 <div style="background:var(--info-bg);border:1px solid var(--primary-light2);border-radius:6px;padding:14px">
 <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--primary);margin-bottom:6px"> Hiring Recommendation</div>
 <p style="color:var(--text2);font-size:13px;line-height:1.7;margin:0">${esc(a.recommendation)}</p>
 </div>`:''}
 `;
}

// SKILL EXPLANATION PANEL 
function buildExplainPanel(){
 const c=selCand;if(!c)return;
 const a=c.analysis||{};
 const ex=a.explanation||{};
 const matchedSkills=ex.matchedSkills||[];
 const missingSkills=ex.missingSkills||[];
 const matchedKw=ex.matchedKeywords||[];
 const missingKw=ex.missingKeywords||[];
 const expYears=ex.experienceYears||0;
 const reqYears=ex.requiredYears||0;
 const totalSkills=ex.totalJDSkills||0;
 const matchedTechCount=ex.matchedTechCount||matchedSkills.length;

 document.getElementById('pExplain').innerHTML=`
 <!-- Skill Match Summary Bar -->
 <div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:16px">
 <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
 <div style="font-size:13px;font-weight:700;color:var(--text)">Skill Match Overview</div>
 <span style="font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:14px;color:${sc(c.score??0)}">${matchedTechCount}/${totalSkills} skills matched</span>
 </div>
 ${bar(totalSkills>0?Math.round(matchedTechCount/totalSkills*100):0, scBar(c.score??0))}
 <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:11px;color:var(--text3)">
 <span>0%</span><span>50%</span><span>100%</span>
 </div>
 </div>

 <!-- Matched Skills -->
 <div style="margin-bottom:16px">
 <div class="section-label" style="color:var(--success);margin-bottom:8px"> Matched Skills (${matchedSkills.length})</div>
 ${matchedSkills.length>0?`
 <div style="display:flex;flex-wrap:wrap;gap:6px">
 ${matchedSkills.map(s=>`<span style="background:var(--success-bg);color:var(--success);border:1px solid var(--success-border);border-radius:12px;padding:4px 10px;font-size:12px;font-weight:600"> ${esc(s)}</span>`).join('')}
 </div>`:`<div style="color:var(--text4);font-size:12px;padding:8px;background:var(--surface2);border-radius:4px">No matching skills found</div>`}
 </div>

 <!-- Missing Skills -->
 <div style="margin-bottom:16px">
 <div class="section-label" style="color:var(--danger);margin-bottom:8px"> Missing Skills (${missingSkills.length})</div>
 ${missingSkills.length>0?`
 <div style="display:flex;flex-wrap:wrap;gap:6px">
 ${missingSkills.map(s=>`<span style="background:var(--danger-bg);color:var(--danger);border:1px solid var(--danger-border);border-radius:12px;padding:4px 10px;font-size:12px;font-weight:600"> ${esc(s)}</span>`).join('')}
 </div>`:`<div style="color:var(--success);font-size:12px;padding:8px;background:var(--success-bg);border-radius:4px">All required skills matched!</div>`}
 </div>

 <!-- Experience Match -->
 ${reqYears>0?`
 <div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:16px">
 <div class="section-label" style="margin-bottom:10px"> Experience Match</div>
 <div style="display:flex;gap:16px;align-items:center">
 <div style="text-align:center">
 <div style="font-family:'IBM Plex Mono',monospace;font-size:24px;font-weight:700;color:${expYears>=reqYears?'var(--success)':'var(--danger)'}">${expYears}</div>
 <div style="font-size:10px;color:var(--text3)">Years Found</div>
 </div>
 <div style="flex:1">${bar(reqYears>0?Math.min(100,Math.round(expYears/reqYears*100)):0, expYears>=reqYears?'var(--success)':'var(--danger)')}</div>
 <div style="text-align:center">
 <div style="font-family:'IBM Plex Mono',monospace;font-size:24px;font-weight:700;color:var(--text3)">${reqYears}+</div>
 <div style="font-size:10px;color:var(--text3)">Required</div>
 </div>
 </div>
 <div style="margin-top:8px;font-size:12px;color:${expYears>=reqYears?'var(--success)':'var(--danger)'}">
 ${expYears>=reqYears?` Meets experience requirement`:` Experience gap: needs ${reqYears-expYears} more year(s)`}
 </div>
 </div>`:''}

 <!-- Keyword Analysis -->
 ${matchedKw.length>0||missingKw.length>0?`
 <div style="margin-bottom:16px">
 <div class="section-label" style="margin-bottom:10px"> Keyword Analysis (NLP)</div>
 <div style="background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:12px">
 ${matchedKw.length>0?`
 <div style="margin-bottom:10px">
 <div style="font-size:11px;font-weight:600;color:var(--success);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px"> Found Keywords</div>
 <div style="display:flex;flex-wrap:wrap;gap:5px">
 ${matchedKw.map(k=>`<span class="kw-tag kw-matched">${esc(k)}</span>`).join('')}
 </div>
 </div>`:''}
 ${missingKw.length>0?`
 <div>
 <div style="font-size:11px;font-weight:600;color:var(--danger);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px"> Missing Keywords</div>
 <div style="display:flex;flex-wrap:wrap;gap:5px">
 ${missingKw.slice(0,10).map(k=>`<span class="kw-tag kw-missing">${esc(k)}</span>`).join('')}
 </div>
 </div>`:''}
 </div>
 </div>`:''}

 <!-- Score Breakdown -->
 <div style="background:var(--info-bg);border:1px solid var(--primary-light2);border-radius:6px;padding:14px">
 <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--primary);margin-bottom:8px"> Score Breakdown</div>
 <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
 ${a.dimensions?Object.entries(a.dimensions).map(([k,v])=>`
 <div style="background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:8px">
 <div style="font-size:10px;color:var(--text3);margin-bottom:2px">${esc(k)}</div>
 <div style="font-family:'IBM Plex Mono',monospace;font-weight:700;font-size:16px;color:${sc(v)}">${v}<span style="font-size:10px;color:var(--text4)">/100</span></div>
 </div>
 `).join(''):''}
 </div>
 </div>
 `;
}

// PARSED RESUME PANEL 
function buildParsedPanel(){
 const c=selCand;if(!c)return;
 const a=c.analysis||{};
 const pr=a.parsedResume||{};
 const skills=pr.skills||[];
 const sections=pr.sections||[];

 document.getElementById('pParsed').innerHTML=`
 <div style="margin-bottom:16px">
 <div class="section-label" style="margin-bottom:10px"> Extracted Candidate Info</div>
 <div style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:14px">
 <div style="display:grid;grid-template-columns:auto 1fr;gap:6px 16px;font-size:13px">
 <span style="color:var(--text3);font-weight:600">Name</span>
 <span style="color:var(--text)">${esc(pr.name||c.name||'—')}</span>
 <span style="color:var(--text3);font-weight:600">Email</span>
 <span style="color:var(--info)">${esc(pr.email||'Not found')}</span>
 <span style="color:var(--text3);font-weight:600">Phone</span>
 <span style="color:var(--text2)">${esc(pr.phone||'Not found')}</span>
 <span style="color:var(--text3);font-weight:600">Experience</span>
 <span style="color:var(--text2)">${pr.experienceYears>0?pr.experienceYears+' years (calculated from dates)':'Not detected'}</span>
 <span style="color:var(--text3);font-weight:600">Degree</span>
 <span style="color:var(--text2)">${esc(pr.degree||'Not detected')}</span>
 </div>
 </div>
 </div>

 <!-- Detected Sections -->
 <div style="margin-bottom:16px">
 <div class="section-label" style="margin-bottom:8px"> Detected Sections</div>
 <div style="display:flex;flex-wrap:wrap;gap:6px">
 ${['skills','experience','education','summary','certifications','projects','other'].map(s=>{
 const found=sections.includes(s);
 return `<span style="padding:4px 10px;border-radius:12px;font-size:12px;font-weight:600;background:${found?'var(--success-bg)':'var(--surface2)'};color:${found?'var(--success)':'var(--text4)'};border:1px solid ${found?'var(--success-border)':'var(--border)'}">
 ${found?'':''} ${s.charAt(0).toUpperCase()+s.slice(1)}
 </span>`;
 }).join('')}
 </div>
 </div>

 <!-- Extracted Skills from Skills Section -->
 ${skills.length>0?`
 <div style="margin-bottom:16px">
 <div class="section-label" style="margin-bottom:8px"> Extracted Skills (${skills.length})</div>
 <div style="background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:12px;display:flex;flex-wrap:wrap;gap:6px">
 ${skills.slice(0,30).map(s=>`<span style="background:var(--bg);border:1px solid var(--border);border-radius:4px;padding:3px 8px;font-size:12px;color:var(--text2)">${esc(s)}</span>`).join('')}
 ${skills.length>30?`<span style="color:var(--text4);font-size:11px;padding:3px 8px">+${skills.length-30} more</span>`:''}
 </div>
 </div>`:''}

 <!-- Parser Notes -->
 <div style="background:var(--warn-bg);border:1px solid var(--warn-border);border-radius:6px;padding:12px">
 <div style="font-size:11px;font-weight:700;color:var(--warn);margin-bottom:4px"> Parser Info</div>
 <div style="font-size:12px;color:var(--text3);line-height:1.6">
 ${c.parsedViaBackend
 ?`<span style="color:var(--success);font-weight:600"> Parsed via Python backend</span> using ${esc(c.parsedData?.engine||'pdfplumber/python-docx')}. Full structured extraction with table support.`
 :`Parsed via browser-side engine (${esc(c.parsedData?.engine||'pdf.js/mammoth')}). Install pdfplumber + python-docx on the server for higher accuracy.`}
 ${pr.experienceYears===0?' Experience years could not be calculated — no date ranges detected.':''}
 ${!pr.email?' No email detected in resume.':''}
 </div>
 </div>
 `;
}

// ATS PANEL 
function buildATSPanel(){
 const c=selCand;if(!c)return;
 if(!c.ats){document.getElementById('pATS').innerHTML=`<div style="text-align:center;padding:40px;color:var(--text4)"><div style="font-size:32px;margin-bottom:8px"></div><div style="font-size:14px">No ATS data available</div></div>`;return;}
 const ats=c.ats,col=sc(ats.atsScore),bg=scBg(ats.atsScore),bd=scBd(ats.atsScore),barC=scBar(ats.atsScore);
 const circ=2*Math.PI*34;
 document.getElementById('pATS').innerHTML=`
 <div class="match-hero" style="background:${bg};border:1px solid ${bd};border-radius:8px;padding:16px;display:flex;align-items:center;gap:16px;margin-bottom:16px">
 <div style="position:relative;flex-shrink:0">
 <svg width="80" height="80" style="transform:rotate(-90deg)">
 <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" stroke-width="7"/>
 <circle cx="40" cy="40" r="34" fill="none" stroke="${barC}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(ats.atsScore/100)*circ} ${circ}"/>
 </svg>
 <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column">
 <div style="color:${col};font-weight:700;font-size:20px;font-family:'IBM Plex Mono',monospace;line-height:1">${ats.atsScore}</div>
 <div style="color:${col};font-size:9px;font-weight:600">/100</div>
 </div>
 </div>
 <div>
 <div style="font-weight:700;font-size:15px;color:${col};margin-bottom:4px">${al(ats.atsScore)}</div>
 <div style="color:var(--text3);font-size:12px;line-height:1.6;max-width:260px">${esc(ats.summary||'')}</div>
 </div>
 </div>
 ${ats.subScores&&Object.keys(ats.subScores).length?`
 <div class="section-label">ATS Sub-Scores</div>
 <div style="background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:14px;margin-bottom:16px">
 ${Object.entries(ats.subScores).map(([k,v])=>`
 <div style="margin-bottom:12px">
 <div style="display:flex;justify-content:space-between;margin-bottom:5px">
 <span style="font-size:13px;font-weight:500;color:var(--text2)">${esc(k)}</span>
 <span style="color:${sc(v)};font-weight:700;font-size:12px;font-family:'IBM Plex Mono',monospace">${v}/100</span>
 </div>
 ${bar(v,scBar(v))}
 </div>
 `).join('')}
 </div>`:''}
 ${ats.sections&&Object.keys(ats.sections).length?`
 <div class="section-label">Required Sections</div>
 <div style="background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:4px 14px;margin-bottom:16px">
 ${Object.entries(ats.sections).map(([k,v])=>`
 <div class="sf-row">
 <span style="font-size:13px;color:var(--text2)">${esc(k)}</span>
 <span class="badge ${v?'badge-success':'badge-danger'}">${v?' Found':' Missing'}</span>
 </div>
 `).join('')}
 </div>`:''}
 ${ats.keywords?`
 <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
 <div class="section-label" style="margin-bottom:0">Keyword Analysis</div>
 <span class="badge ${ats.keywordMatchPct>=60?'badge-success':ats.keywordMatchPct>=40?'badge-warn':'badge-danger'}">${ats.keywordMatchPct||0}% matched</span>
 </div>
 <div style="background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:14px;margin-bottom:16px">
 ${ats.keywords.matched?.length?`<div style="margin-bottom:10px"><div style="font-size:11px;font-weight:600;color:var(--success);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px"> Found Keywords</div><div>${ats.keywords.matched.map(k=>`<span class="kw-tag kw-matched">${esc(k)}</span>`).join('')}</div></div>`:''}
 ${ats.keywords.missing?.length?`<div><div style="font-size:11px;font-weight:600;color:var(--danger);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px"> Missing Keywords</div><div>${ats.keywords.missing.map(k=>`<span class="kw-tag kw-missing">${esc(k)}</span>`).join('')}</div></div>`:''}
 </div>`:''}
 ${ats.formattingIssues?.length?`
 <div class="section-label" style="color:var(--warn)"> Formatting Issues</div>
 <div style="background:var(--warn-bg);border:1px solid var(--warn-border);border-radius:6px;padding:10px 14px;margin-bottom:16px">
 ${ats.formattingIssues.map(x=>`<div style="display:flex;gap:8px;padding:5px 0;border-bottom:1px solid var(--warn-border)"><span style="color:var(--warn);flex-shrink:0">•</span><span style="color:var(--text2);font-size:12px;line-height:1.5">${esc(x)}</span></div>`).join('')}
 </div>`:''}
 ${ats.improvements?.length?`
 <div class="section-label" style="color:var(--primary)"> Improvements</div>
 <div style="background:var(--info-bg);border:1px solid var(--primary-light2);border-radius:6px;padding:10px 14px">
 ${ats.improvements.map((tip,i)=>`<div style="display:flex;gap:10px;padding:6px 0;border-bottom:${i<ats.improvements.length-1?'1px solid var(--primary-light2)':'none'}"><span style="color:var(--primary);flex-shrink:0;font-weight:700;font-size:12px;min-width:16px">${i+1}.</span><span style="color:var(--text2);font-size:12px;line-height:1.6">${esc(tip)}</span></div>`).join('')}
 </div>`:''}
 `;
}

// RESUME PANEL 
function buildResumePanel(){
 const c=selCand;if(!c)return;
 const lines=(c.text||'').split('\n'),words=c.text?.split(/\s+/).filter(Boolean).length||0;
 document.getElementById('pResume').innerHTML=`
 <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px">
 <div>
 <div style="font-weight:700;font-size:14px;color:var(--text)">${esc(c.name)}</div>
 <div style="color:var(--text3);font-size:12px;margin-top:2px;display:flex;align-items:center;gap:6px">
 ${c.source==='file'?`<span class="badge badge-info" style="font-size:9px">${(c.fileType||'').toUpperCase()}</span>`:''}
 <span>${esc(c.fileName||c.role||'Resume')}</span>
 <span>·</span><span>${lines.filter(l=>l.trim()).length} lines</span>
 <span>·</span><span>${words} words</span>
 </div>
 </div>
 <button id="cpBtn" onclick="copyResumeTxt()" class="btn btn-default btn-sm">⎘ Copy</button>
 </div>
 <div class="resume-box">
 ${lines.map((line,i)=>{
 const t=line.trim();
 if(!t) return '<div style="height:8px"></div>';
 if(isHdr(t)) return `<div style="color:var(--primary);font-weight:700;font-size:10px;letter-spacing:.12em;text-transform:uppercase;margin-top:${i===0?0:14}px;margin-bottom:4px;padding-bottom:4px;border-bottom:2px solid var(--primary-light)">${esc(t)}</div>`;
 if(/@/.test(t)) return `<div style="color:var(--info);font-size:12px;margin-bottom:2px">${esc(t)}</div>`;
 if(/^\s*[-•·*]/.test(line)) return `<div style="color:var(--text2);padding-left:12px;display:flex;gap:8px;margin-bottom:2px"><span style="color:var(--primary);flex-shrink:0">›</span><span>${esc(t.replace(/^[-•·*]\s*/,''))}</span></div>`;
 if(/\d{4}/.test(t)&&t.length<80) return `<div style="color:var(--text3);font-size:11px;margin-bottom:2px;font-style:italic">${esc(t)}</div>`;
 return `<div style="color:var(--text2);margin-bottom:2px">${esc(t)}</div>`;
 }).join('')}
 </div>
 `;
}
function copyResumeTxt(){
 if(!selCand)return;
 navigator.clipboard?.writeText(selCand.text||'');
 const b=document.getElementById('cpBtn');
 if(b){b.textContent=' Copied!';b.style.color='var(--success)';setTimeout(()=>{b.textContent='⎘ Copy';b.style.color='';},2000);}
}

// MODAL 
function openModal(i){
 modalResume=resumes[i];
 document.getElementById('modal').style.display='flex';
 document.getElementById('mName2').textContent=modalResume.name;
 document.getElementById('mMeta').textContent=`${modalResume.role||'Resume'} · ${(modalResume.text||'').split(/\s+/).filter(Boolean).length} words`;
 const lines=(modalResume.text||'').split('\n');
 document.getElementById('mBody').innerHTML=lines.map((line,i)=>{
 const t=line.trim();
 if(!t) return '<div style="height:8px"></div>';
 if(isHdr(t)) return `<div style="color:var(--primary);font-weight:700;font-size:10px;letter-spacing:.12em;text-transform:uppercase;margin-top:${i===0?0:16}px;margin-bottom:6px;padding-bottom:5px;border-bottom:2px solid var(--primary-light)">${esc(t)}</div>`;
 if(/@/.test(t)) return `<div style="color:var(--info);font-size:13px;margin-bottom:3px">${esc(t)}</div>`;
 if(/^\s*[-•·*]/.test(line)) return `<div style="color:var(--text2);font-size:13px;padding-left:14px;display:flex;gap:8px;margin-bottom:3px;line-height:1.6"><span style="color:var(--primary);flex-shrink:0">›</span><span>${esc(t.replace(/^[-•·*]\s*/,''))}</span></div>`;
 if(/\d{4}/.test(t)&&t.length<80) return `<div style="color:var(--text3);font-size:12px;margin-bottom:3px;font-style:italic;line-height:1.6">${esc(t)}</div>`;
 return `<div style="color:var(--text2);font-size:13px;margin-bottom:3px;line-height:1.7">${esc(t)}</div>`;
 }).join('');
}
function closeModal(){document.getElementById('modal').style.display='none';}
function modalCopy(){
 if(!modalResume)return;
 navigator.clipboard?.writeText(modalResume.text||'');
 const b=document.getElementById('mCopyBtn');
 b.textContent=' Copied!';setTimeout(()=>{b.textContent='⎘ Copy';},2000);
}

function newScreening(){candidates=[];selCand=null;document.getElementById('detailEmpty').style.display='flex';document.getElementById('detailInner').style.display='none';document.getElementById('tnav-screening').classList.remove('done');gotoTab('setup');}

function goBackFromScreening(){
 if(running){if(!confirm('Screening is in progress. Go back to Setup?')) return; running=false;}
 gotoTab('setup');
}

function goBackFromResults(){gotoTab('screening');}

function scrollToTop(){window.scrollTo({top:0,behavior:'smooth'});}
function scrollToBottom(){window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'});}

function confirmResetSetup(){
 if(!confirm('Reset job description and candidates to start fresh?')) return;
 resumes=[];candidates=[];selCand=null;
 document.getElementById('jdArea').value=SAMPLE_JD;
 SAMPLE_RESUMES.forEach((r,i)=>resumes.push({...r,id:i}));
 updateJDStats();renderResumeList();
 document.getElementById('tnav-screening').classList.remove('done');
 document.getElementById('detailEmpty').style.display='flex';
 document.getElementById('detailInner').style.display='none';
 hideError();
}
