// ATS TOGGLE 
function toggleATS(){
 enableATS=!enableATS;
 const tog=document.getElementById('atsToggle');
 const thumb=document.getElementById('atsThumb');
 tog.classList.toggle('on',enableATS);
 tog.classList.toggle('off',!enableATS);
 document.getElementById('runBtn').innerHTML=`<span></span><span>Start Screening${enableATS?' + ATS Check':''} (${resumes.length})</span>`;
}

// AUTH 
let currentUser = null;

async function checkAuth(){
 try{
 const r=await fetch('/api/me');
 const d=await r.json();
 currentUser=d.loggedIn?d.user:null;
 renderAuthBar();
 }catch(e){ currentUser=null; }
}

function renderAuthBar(){
 const bar=document.getElementById('authBar');
 const adminLink=document.getElementById('adminLink');
 if(!bar)return;
 if(currentUser){
 bar.innerHTML=`
 <span style="background:rgba(255,255,255,.12);border-radius:10px;padding:2px 8px;font-size:11px;font-weight:600;color:rgba(255,255,255,.85)">${esc(currentUser.role.toUpperCase())}</span>
 <button onclick="doLogout()" style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:rgba(255,255,255,.7);border-radius:5px;padding:3px 10px;font-size:11px;font-family:inherit;cursor:pointer">Sign Out</button>`;
 if(adminLink) adminLink.style.display = currentUser.role==='admin' ? 'block' : 'none';
 } else {
 bar.innerHTML=`<a href="/login" style="font-size:12px;color:rgba(255,255,255,.55);text-decoration:none;padding:3px 10px;border:1px solid rgba(255,255,255,.15);border-radius:5px">HR Login</a>`;
 if(adminLink) adminLink.style.display='none';
 }
}

async function doLogout(){
 await fetch('/api/logout',{method:'POST'});
 window.location.href='/login';
}

// BACKEND CAPABILITY DETECTION 
let backendCapabilities = { pdfEngine: null, docxEngine: null };

async function detectBackend(){
 try{
 const r=await fetch('/api/health');
 const d=await r.json();
 backendCapabilities.pdfEngine=d.pdf_engine;
 backendCapabilities.docxEngine=d.docx_engine;
 updateBackendBadge();
 }catch(e){ /* backend not available */ }
}

function updateBackendBadge(){
 const el=document.getElementById('backendBadge');
 if(!el)return;
 const hasPdf=backendCapabilities.pdfEngine;
 const hasDocx=backendCapabilities.docxEngine;
 if(hasPdf||hasDocx){
 el.style.display='inline';
 el.title=`PDF: ${hasPdf||'browser fallback'} | DOCX: ${hasDocx||'browser fallback'}`;
 }
}

// RESUME LIST 
function renderResumeList(){
 const el=document.getElementById('resumeList');
 const btn=document.getElementById('runBtn');
 if(btn) btn.innerHTML=`<span></span><span>Start Screening${enableATS?' + ATS Check':''} (${resumes.length})</span>`;
 document.getElementById('cand-count-badge').textContent=`${resumes.length} added`;
 document.getElementById('cand-count-badge').className='badge '+(resumes.length>0?'badge-success':'badge-neutral');
 if(!resumes.length){el.innerHTML='<div style="color:var(--text4);font-size:12px;padding:8px 0">No resumes added yet.</div>';return;}
 el.innerHTML = resumes.map((r,i)=>`
 <div style="background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:9px 12px;display:flex;align-items:center;gap:10px;margin-bottom:6px">
 <div class="avatar" style="background:${avatarColor(r.name)};color:#fff;font-size:11px">${r.name.trim().charAt(0).toUpperCase()}</div>
 <div style="flex:1;min-width:0">
 <div style="font-weight:600;font-size:13px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(r.name)}</div>
 <div style="color:var(--text3);font-size:11px;display:flex;align-items:center;gap:5px;margin-top:1px">
 ${r.source==='file'?`<span class="badge badge-info" style="font-size:9px;padding:1px 5px">${(r.fileType||'txt').toUpperCase()}</span>`:''}
 ${r.parsedViaBackend?`<span class="badge badge-success" style="font-size:9px;padding:1px 5px"> Backend</span>`:''}
 <span>${esc(r.role||'Candidate')}</span>
 </div>
 </div>
 <button onclick="openModal(${i})" class="btn btn-default btn-sm">View</button>
 <button onclick="removeResume(${i})" style="background:none;border:none;color:var(--text4);cursor:pointer;font-size:18px;padding:2px;line-height:1;flex-shrink:0" title="Remove">x</button>
 </div>
 `).join('');
}

function removeResume(i){resumes.splice(i,1);renderResumeList();}

function addManual(){
 const n=document.getElementById('mName').value.trim();
 const ro=document.getElementById('mRole').value.trim();
 const tx=document.getElementById('mText').value.trim();
 if(!n||!tx) return;
 resumes.push({name:n,role:ro,text:tx,source:'manual',id:Date.now()});
 document.getElementById('mName').value='';
 document.getElementById('mRole').value='';
 document.getElementById('mText').value='';
 renderResumeList();
}

// FILE EXTRACTION 
function loadScript(src){
 return new Promise((res,rej)=>{
 if(document.querySelector(`script[src="${src}"]`))return res();
 const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;
 document.head.appendChild(s);
 });
}

// Backend-powered parsing (preferred when available)
async function extractTextViaBackend(file){
 const fd=new FormData();
 fd.append('file',file);
 const r=await fetch('/api/parse-resume',{method:'POST',body:fd});
 if(!r.ok) throw new Error(`Backend parse failed: ${r.status}`);
 const d=await r.json();
 if(d.error) throw new Error(d.error);
 return d; // returns full structured result including raw text
}

// Client-side fallback
async function extractTextFrontend(file){
 const n=file.name.toLowerCase();
 if(n.endsWith('.pdf')){
 await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
 const lib=window['pdfjs-dist/build/pdf'];
 lib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
 const pdf=await lib.getDocument({data:await file.arrayBuffer()}).promise;
 let txt='';
 for(let i=1;i<=pdf.numPages;i++){
 const pg=await pdf.getPage(i);
 const c=await pg.getTextContent();
 txt+=c.items.map(x=>x.str).join(' ')+'\n';
 }
 return {raw:txt.trim(),source:'browser-pdfjs'};
 }
 if(n.endsWith('.docx')||n.endsWith('.doc')){
 await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
 const r=await window.mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});
 return {raw:r.value.trim(),source:'browser-mammoth'};
 }
 return new Promise((res,rej)=>{
 const r=new FileReader();
 r.onload=e=>res({raw:e.target.result,source:'browser-text'});
 r.onerror=rej;
 r.readAsText(file);
 });
}

async function extractText(file){
 // Try backend first (has pdfplumber/python-docx), fall back to frontend
 try{
 const result=await extractTextViaBackend(file);
 return result; // {raw, name, email, skills, experienceYears, ...}
 }catch(e){
 console.warn('Backend parse unavailable, using frontend fallback:',e.message);
 const result=await extractTextFrontend(file);
 return {raw:result.raw, engine:result.source};
 }
}

async function handleResumeFiles(files){
 const valid=Array.from(files).filter(f=>/\.(pdf|doc|docx|txt)$/i.test(f.name));
 if(!valid.length){showDrop('Only PDF, DOC, DOCX or TXT supported.',false,'error');return;}
 showDrop(`Parsing ${valid.length} file(s)…`,true,'info');

 for(const f of valid){
 try{
 const parsed=await extractText(f);
 const text=parsed.raw||parsed;
 const ext=f.name.split('.').pop().toLowerCase();
 const wasBackend=!!parsed.engine && !parsed.engine.startsWith('browser');
 const resume={
 name: parsed.name||f.name.replace(/\.[^.]+$/,'').replace(/[_\-]/g,' '),
 role: parsed.degree||'',
 text: typeof text==='string'?text:text,
 source: 'file',
 fileType: ext,
 fileName: f.name,
 parsedViaBackend: wasBackend,
 parsedData: wasBackend?parsed:null,
 id: Date.now()+Math.random(),
 };
 // If backend gave us a real name, use it; else derive nicely from filename
 if(parsed.name && parsed.name!=='Unknown' && parsed.name.trim().length>1){
 resume.name=parsed.name;
 } else {
 // Convert filename like "Riddhi_vegad_resume.pdf" -> "Riddhi Vegad"
 let fn=f.name.replace(/\.[^.]+$/,'').replace(/[_\-]/g,' ');
 fn=fn.replace(/(resume|cv|curriculum|vitae|final|new|updated|copy)/gi,'').trim();
 fn=fn.replace(/\s+/g,' ').trim();
 fn=fn.split(' ').map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(' ');
 resume.name=fn||'Candidate';
 }
 resumes.push(resume);
 }catch(e){
 showDrop(`Error: ${f.name}: ${e.message}`,false,'error');return;
 }
 }
 renderResumeList();
 showDrop(` ${valid.length} resume(s) added successfully`,true,'success');
 setTimeout(()=>document.getElementById('dropSt').style.display='none',3000);
}

async function handleJDFile(file){
 if(!file)return;
 const st=document.getElementById('jdFileSt');
 st.style.display='inline';st.style.color='var(--text3)';st.textContent='Reading…';
 try{
 const parsed=await extractText(file);
 const text=typeof parsed==='string'?parsed:(parsed.raw||'');
 document.getElementById('jdArea').value=text;
 updateJDStats();
 st.style.color='var(--success)';st.textContent=` ${file.name}`;
 setTimeout(()=>st.style.display='none',3000);
 }catch(e){st.style.color='var(--danger)';st.textContent=`Error: ${e.message}`;}
}

function showDrop(msg,ok,type){
 const el=document.getElementById('dropSt');
 el.style.display='block';
 const map={success:'alert alert-success',error:'alert alert-error',info:'alert alert-info',warn:'alert alert-warn'};
 el.className=map[type]||'alert alert-info';
 el.textContent=msg;
}

// MODE 
let appMode='demo';
function setMode(m){
 appMode=m;
 const badge=document.getElementById('topbar-mode-badge');
 badge.textContent=m==='demo'?' Demo Mode':' Live AI';
 document.getElementById('modeDemo').classList.toggle('active',m==='demo');
 document.getElementById('modeLive').classList.toggle('active',m==='live');
 document.getElementById('demoInfo').style.display=m==='demo'?'flex':'none';
 document.getElementById('liveInfo').style.display=m==='live'?'block':'none';
}
