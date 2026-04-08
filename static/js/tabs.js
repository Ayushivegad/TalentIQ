// TABS 
function gotoTab(t){
 if(running && t!=='screening') return;
 ['setup','screening','results','report'].forEach(x=>{
 const pg=document.getElementById('page-'+x);
 const nav=document.getElementById('tnav-'+x);
 if(!pg) return;
 if(x===t){
 pg.classList.add('active');
 if(x==='report'){
 pg.style.cssText='display:block;min-height:calc(100vh - 88px);overflow-y:auto;width:100%';
 } else if(x==='setup'){
 pg.style.cssText='display:flex;flex-direction:column;flex:1';
 } else {
 pg.style.cssText='display:block;flex:1';
 }
 } else {
 pg.classList.remove('active');
 pg.style.cssText='display:none';
 }
 if(nav) nav.classList.toggle('active',x===t);
 });
 if(t==='report') setTimeout(buildEvalReport,50);
}

function showError(msg){
 let el=document.getElementById('runError');
 el.textContent=' '+msg; el.style.display='flex';
}
function hideError(){document.getElementById('runError').style.display='none';}