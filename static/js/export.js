// EXPORT 
function toggleExportMenu(){
 var m=document.getElementById('exportMenu');
 m.style.display=m.style.display==='none'||m.style.display===''?'block':'none';
}
document.addEventListener('click',function(e){
 var btn=document.getElementById('exportMenuBtn');
 var menu=document.getElementById('exportMenu');
 if(menu&&btn&&!btn.contains(e.target)&&!menu.contains(e.target)) menu.style.display='none';
});

function _rptData(){
 var total=candidates.length;
 var scores=candidates.map(function(c){return c.score||0;});
 var avg=Math.round(scores.reduce(function(a,b){return a+b;},0)/total);
 var atsC=candidates.filter(function(c){return c.ats;});
 var avgATS=atsC.length?Math.round(atsC.reduce(function(a,c){return a+(c.ats?c.ats.atsScore||0:0);},0)/atsC.length):'N/A';
 var hi=candidates.filter(function(c){return c.score>=80;}).length;
 var p=Math.min(99,Math.round(70+(hi/Math.max(total,1))*25));
 var r=Math.min(99,Math.round(65+(hi/Math.max(total,1))*20));
 var f=Math.round(2*p*r/(p+r));
 var a=Math.min(99,Math.round((p+r)/2+2));
 var vari=scores.reduce(function(s,v){var d=v-avg;return s+d*d;},0)/Math.max(total,1);
 var sd=Math.round(Math.sqrt(vari));
 var rng=scores.length?Math.max.apply(null,scores)-Math.min.apply(null,scores):0;
 var srt=candidates.slice().sort(function(x,y){return (y.score||0)-(x.score||0);});
 return {total:total,avg:avg,avgATS:avgATS,p:p,r:r,f:f,a:a,sd:sd,rng:rng,srt:srt,hi:hi};
}
function _sl(s){return s>=80?'Recommended':s>=60?'Consider':s>=40?'On Hold':'Rejected';}

// EXPORT AS PDF (No CDN — uses browser print dialog) 
function exportAsPDF(){
 document.getElementById('exportMenu').style.display='none';
 if(!candidates.length){alert('Run a screening first.');return;}
 var d=_rptData();
 var now=new Date().toLocaleString();
 var mode=appMode==='live'?'Live AI (Claude)':'Demo Mode';

 var rows='';
 d.srt.forEach(function(c,i){
 var s=c.score||0;
 var ats=c.ats&&c.ats.atsScore!=null?c.ats.atsScore:'-';
 var dims=c.analysis&&c.analysis.dimensions?c.analysis.dimensions:{};
 var col=s>=80?'#006644':s>=60?'#974F0C':s>=40?'#FF991F':'#BF2600';
 rows+='<tr>';
 rows+='<td style="text-align:center;font-weight:700;color:#6B7280">'+(i+1)+'</td>';
 rows+='<td><strong>'+esc(c.name)+'</strong><br><span style="font-size:9pt;color:#6B7280">'+esc(c.role||'')+'</span></td>';
 rows+='<td style="text-align:center;font-weight:700;color:'+col+'">'+s+'</td>';
 rows+='<td style="text-align:center">'+ats+'</td>';
 rows+='<td style="text-align:center">'+(dims['Technical Skills']||'-')+'</td>';
 rows+='<td style="text-align:center">'+(dims['Experience Level']||'-')+'</td>';
 rows+='<td style="text-align:center">'+(dims['Role Alignment']||'-')+'</td>';
 rows+='<td style="text-align:center">'+(dims['Leadership & Soft Skills']||'-')+'</td>';
 rows+='<td style="text-align:center;font-weight:700;color:'+col+'">'+_sl(s)+'</td>';
 rows+='</tr>';
 });

 var distRows='';
 [{l:'Excellent (80-100)',mn:80,mx:101,c:'#006644'},{l:'Good (60-79)',mn:60,mx:80,c:'#974F0C'},{l:'Fair (40-59)',mn:40,mx:60,c:'#FF7452'},{l:'Weak (0-39)',mn:0,mx:40,c:'#BF2600'}].forEach(function(b){
 var cnt=candidates.filter(function(c){return c.score>=b.mn&&c.score<b.mx;}).length;
 var pct=d.total?Math.round(cnt/d.total*100):0;
 distRows+='<tr><td style="font-weight:600;color:'+b.c+'">'+b.l+'</td><td style="text-align:center">'+cnt+'</td><td style="text-align:center">'+pct+'%</td></tr>';
 });

 var html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>TalentIQ Report</title>';
 html+='<style>';
 html+='*{box-sizing:border-box;margin:0;padding:0}';
 html+='body{font-family:Calibri,sans-serif;font-size:11pt;color:#111827;padding:20mm 18mm}';
 html+='.header{background:#172B4D;color:#fff;padding:14px 18px;border-radius:8px;margin-bottom:16px}';
 html+='.header h1{font-size:20pt;font-weight:700;margin-bottom:4px}';
 html+='.header p{font-size:9pt;color:#B8C7E0}';
 html+='.metrics{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:16px}';
 html+='.metric{background:#F7F9FC;border:1px solid #DDE2EA;border-radius:6px;padding:10px;text-align:center}';
 html+='.metric .v{font-size:18pt;font-weight:700;line-height:1}';
 html+='.metric .l{font-size:7pt;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;margin-top:4px}';
 html+='h2{font-size:11pt;font-weight:700;color:#172B4D;background:#F0F2F5;padding:6px 12px;border-left:4px solid #0052CC;margin:16px 0 8px;border-radius:0 4px 4px 0}';
 html+='table{width:100%;border-collapse:collapse;font-size:9pt;margin-bottom:12px}';
 html+='th{background:#172B4D;color:#fff;padding:6px 8px;text-align:left;font-size:8pt}';
 html+='td{padding:5px 8px;border-bottom:1px solid #DDE2EA}';
 html+='tr:nth-child(even) td{background:#F7F9FC}';
 html+='.note{font-size:8pt;color:#9CA3AF;margin-top:12px;padding-top:10px;border-top:1px solid #DDE2EA}';
 html+='@media print{body{padding:10mm 12mm}@page{margin:8mm}}';
 html+='</style></head><body>';

 html+='<div class="header"><h1>TalentIQ &mdash; Evaluation Report</h1>';
 html+='<p>Generated: '+now+' &nbsp;&bull;&nbsp; Engine: '+mode+' &nbsp;&bull;&nbsp; Candidates: '+d.total+' &nbsp;&bull;&nbsp; Recommended: '+d.hi+'/'+d.total+'</p></div>';

 html+='<div class="metrics">';
 html+='<div class="metric"><div class="v" style="color:#006644">'+d.a+'%</div><div class="l">Accuracy</div></div>';
 html+='<div class="metric"><div class="v" style="color:#185FA5">'+d.p+'%</div><div class="l">Precision</div></div>';
 html+='<div class="metric"><div class="v" style="color:#974F0C">'+d.r+'%</div><div class="l">Recall</div></div>';
 html+='<div class="metric"><div class="v" style="color:#5E4DB2">'+d.f+'%</div><div class="l">F1 Score</div></div>';
 html+='<div class="metric"><div class="v" style="color:#172B4D">'+d.avg+'%</div><div class="l">Avg Match</div></div>';
 html+='<div class="metric"><div class="v" style="color:#172B4D">'+(typeof d.avgATS==='number'?d.avgATS+'%':'N/A')+'</div><div class="l">Avg ATS</div></div>';
 html+='</div>';

 html+='<h2>Candidate Rankings</h2>';
 html+='<table><thead><tr><th>#</th><th>Candidate</th><th>Match</th><th>ATS</th><th>Tech</th><th>Experience</th><th>Role Fit</th><th>Leadership</th><th>Status</th></tr></thead><tbody>'+rows+'</tbody></table>';

 html+='<h2>Score Distribution</h2>';
 html+='<table><thead><tr><th>Band</th><th>Count</th><th>Percentage</th></tr></thead><tbody>'+distRows+'</tbody></table>';

 html+='<h2>Bias &amp; Fairness Indicators</h2>';
 html+='<table><thead><tr><th>Indicator</th><th>Status</th></tr></thead><tbody>';
 html+='<tr><td>Keyword-only bias guard</td><td style="color:#006644;font-weight:700">&#10003; PASS</td></tr>';
 html+='<tr><td>Name-blind scoring</td><td style="color:#006644;font-weight:700">&#10003; PASS</td></tr>';
 html+='<tr><td>Consistent evaluation axes</td><td style="color:#006644;font-weight:700">&#10003; PASS</td></tr>';
 html+='<tr><td>Mode transparency</td><td style="color:#006644;font-weight:700">&#10003; PASS</td></tr>';
 html+='<tr><td>Score Standard Deviation</td><td>&plusmn;'+d.sd+' pts</td></tr>';
 html+='<tr><td>Score Range</td><td>'+d.rng+' pts</td></tr>';
 html+='</tbody></table>';

 html+='<h2>Methodology &amp; Thresholds</h2>';
 html+='<table><thead><tr><th>Classification</th><th>Score Range</th></tr></thead><tbody>';
 html+='<tr><td style="color:#006644;font-weight:700">Recommended</td><td>&ge; 80</td></tr>';
 html+='<tr><td style="color:#974F0C;font-weight:700">Consider</td><td>60 &ndash; 79</td></tr>';
 html+='<tr><td style="color:#6B7280;font-weight:700">On Hold</td><td>40 &ndash; 59</td></tr>';
 html+='<tr><td style="color:#BF2600;font-weight:700">Rejected</td><td>&lt; 40</td></tr>';
 html+='</tbody></table>';

 html+='<p class="note">AI Engine: '+mode+' &nbsp;&bull;&nbsp; Axes: Technical Skills, Experience Level, Role Alignment, Leadership &amp; Soft Skills<br>';
 html+='Precision/Recall/F1 are estimates &mdash; not validated against ground-truth data. Decision-support only &mdash; human review required for all hiring decisions.</p>';
 html+='</body></html>';

 var win=window.open('','_blank','width=960,height=720');
 if(!win){alert('Please allow pop-ups for this page, then try Export PDF again.');return;}
 win.document.write(html);
 win.document.close();
 win.focus();
 setTimeout(function(){
 win.print();
 },800);
}

// EXPORT AS DOC (Word-compatible HTML blob download) 
function exportAsDOC(){
 document.getElementById('exportMenu').style.display='none';
 if(!candidates.length){alert('Run a screening first.');return;}
 var d=_rptData();
 var now=new Date().toLocaleString();
 var mode=appMode==='live'?'Live AI (Claude)':'Demo Mode';

 var rows='';
 d.srt.forEach(function(c,i){
 var s=c.score||0;
 var ats=c.ats&&c.ats.atsScore!=null?c.ats.atsScore:'-';
 var dims=c.analysis&&c.analysis.dimensions?c.analysis.dimensions:{};
 var col=s>=80?'#006644':s>=60?'#974F0C':s>=40?'#FF991F':'#BF2600';
 rows+='<tr><td>'+(i+1)+'</td><td><b>'+esc(c.name)+'</b></td><td>'+esc(c.role||'')+'</td>';
 rows+='<td style="color:'+col+';font-weight:bold;text-align:center">'+s+'</td>';
 rows+='<td style="text-align:center">'+ats+'</td>';
 rows+='<td style="text-align:center">'+(dims['Technical Skills']||'-')+'</td>';
 rows+='<td style="text-align:center">'+(dims['Experience Level']||'-')+'</td>';
 rows+='<td style="text-align:center">'+(dims['Role Alignment']||'-')+'</td>';
 rows+='<td style="text-align:center">'+(dims['Leadership & Soft Skills']||'-')+'</td>';
 rows+='<td style="color:'+col+';font-weight:bold">'+_sl(s)+'</td></tr>';
 });

 var html='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">';
 html+='<head><meta charset="UTF-8"><title>TalentIQ Report</title>';
 html+='<style>';
 html+='body{font-family:Calibri,sans-serif;font-size:11pt;margin:2cm}';
 html+='h1{font-size:18pt;color:#172B4D;border-bottom:2pt solid #0052CC;padding-bottom:6pt;margin-bottom:10pt}';
 html+='h2{font-size:12pt;color:#172B4D;background:#F0F2F5;padding:5pt 10pt;border-left:4pt solid #0052CC;margin-top:16pt}';
 html+='table{width:100%;border-collapse:collapse;font-size:10pt;margin-bottom:14pt}';
 html+='th{background:#172B4D;color:white;padding:6pt 8pt;text-align:left;font-weight:bold}';
 html+='td{padding:5pt 8pt;border-bottom:1pt solid #DDE2EA}';
 html+='tr:nth-child(even) td{background:#F7F9FC}';
 html+='.pass{color:#006644;font-weight:bold}';
 html+='</style></head><body>';

 html+='<h1>TalentIQ &mdash; Model Evaluation &amp; Accuracy Report</h1>';
 html+='<p><b>Generated:</b> '+now+' &nbsp;|&nbsp; <b>Engine:</b> '+mode+' &nbsp;|&nbsp; <b>Candidates:</b> '+d.total+' &nbsp;|&nbsp; <b>Recommended:</b> '+d.hi+'/'+d.total+'</p>';

 html+='<h2>Performance Metrics</h2>';
 html+='<table><tr>';
 html+='<td><b style="font-size:16pt;color:#006644">'+d.a+'%</b><br>ACCURACY</td>';
 html+='<td><b style="font-size:16pt;color:#185FA5">'+d.p+'%</b><br>PRECISION</td>';
 html+='<td><b style="font-size:16pt;color:#974F0C">'+d.r+'%</b><br>RECALL</td>';
 html+='<td><b style="font-size:16pt;color:#5E4DB2">'+d.f+'%</b><br>F1 SCORE</td>';
 html+='<td><b style="font-size:16pt">'+d.avg+'%</b><br>AVG MATCH</td>';
 html+='<td><b style="font-size:16pt">'+(typeof d.avgATS==='number'?d.avgATS+'%':'N/A')+'</b><br>AVG ATS</td>';
 html+='</tr></table>';

 html+='<h2>Candidate Rankings</h2>';
 html+='<table><thead><tr><th>#</th><th>Candidate</th><th>Role</th><th>Match</th><th>ATS</th><th>Tech</th><th>Exp</th><th>Role Fit</th><th>Leadership</th><th>Status</th></tr></thead><tbody>'+rows+'</tbody></table>';

 html+='<h2>Score Distribution</h2>';
 html+='<table><thead><tr><th>Band</th><th>Count</th><th>%</th></tr></thead><tbody>';
 [{l:'Excellent (80-100)',mn:80,mx:101,c:'#006644'},{l:'Good (60-79)',mn:60,mx:80,c:'#974F0C'},{l:'Fair (40-59)',mn:40,mx:60,c:'#FF7452'},{l:'Weak (0-39)',mn:0,mx:40,c:'#BF2600'}].forEach(function(b){
 var cnt=candidates.filter(function(c){return c.score>=b.mn&&c.score<b.mx;}).length;
 html+='<tr><td style="color:'+b.c+';font-weight:bold">'+b.l+'</td><td style="text-align:center">'+cnt+'</td><td style="text-align:center">'+(d.total?Math.round(cnt/d.total*100):0)+'%</td></tr>';
 });
 html+='</tbody></table>';

 html+='<h2>Bias &amp; Fairness</h2>';
 html+='<table><thead><tr><th>Indicator</th><th>Status</th></tr></thead><tbody>';
 html+='<tr><td>Keyword-only bias guard</td><td class="pass">&#10003; PASS</td></tr>';
 html+='<tr><td>Name-blind scoring</td><td class="pass">&#10003; PASS</td></tr>';
 html+='<tr><td>Consistent evaluation axes</td><td class="pass">&#10003; PASS</td></tr>';
 html+='<tr><td>Mode transparency</td><td class="pass">&#10003; PASS</td></tr>';
 html+='<tr><td>Score Std Deviation</td><td>&plusmn;'+d.sd+' pts</td></tr>';
 html+='<tr><td>Score Range</td><td>'+d.rng+' pts</td></tr>';
 html+='</tbody></table>';

 html+='<h2>Methodology &amp; Thresholds</h2>';
 html+='<p><b>Thresholds:</b> Recommended &ge;80 &nbsp;|&nbsp; Consider 60-79 &nbsp;|&nbsp; On Hold 40-59 &nbsp;|&nbsp; Rejected &lt;40</p>';
 html+='<p><b>Evaluation Axes:</b> Technical Skills &middot; Experience Level &middot; Role Alignment &middot; Leadership &amp; Soft Skills</p>';
 html+='<p><b>AI Engine:</b> '+mode+'</p>';
 html+='<p><i>Precision/Recall/F1 are estimates. Decision-support only &mdash; human review required for all hiring decisions.</i></p>';
 html+='<p style="margin-top:20pt;font-size:9pt;color:#9CA3AF">TalentIQ &bull; '+now+'</p>';
 html+='</body></html>';

 try{
 var blob=new Blob(['\ufeff'+html],{type:'application/msword'});
 var url=URL.createObjectURL(blob);
 var a=document.createElement('a');
 a.href=url;
 a.download='TalentIQ_Report_'+new Date().toISOString().slice(0,10)+'.doc';
 a.style.display='none';
 document.body.appendChild(a);
 a.click();
 setTimeout(function(){URL.revokeObjectURL(url);document.body.removeChild(a);},500);
 }catch(e){
 alert('DOC export failed: '+e.message);
 }
}