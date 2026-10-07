(() => {
 const pages={forside:'Forside',laerermanual:'Lærermanual',manual:'Lærermanual','lav-din-egen-blomst':'Lav din egen AI-blomst','lav-selv':'Lav din egen AI-blomst',blomst:'Lav din egen AI-blomst',plakat:'Plakat','download-app':'Installér app','download-word':'Download Word-tilføjelse',anbefal:'Anbefal',feedback:'Feedback'};
 const downloads={'AI-blomsten-plakat.png':'Plakat med eksempler','plakat.png':'Plakat med eksempler','AI-blomsten-plakat-uden-eksempler.png':'Plakat uden eksempler','laerermanual.pdf':'Lærermanual (PDF)','AI-blomsten-laerermanual.pdf':'Lærermanual (PDF)','AI-blomsten-Windows.zip':'Word-tilføjelse til Windows','Min-AI-blomst-plakat.png':'Egen plakat','Min-AI-blomst.png':'Egen AI-blomst'};
 const events={visit:'Besøg på hjemmesiden',profile:'Udfyldt besøgsprofil',page:'Besøg på siden',leaf:'Klik på AI-blomstens blad',download_click:'Klik på download',flower_download_click:'Klik på download af egen AI-blomst',app_install_click:'Klik på Installér app',recommend_mail_click:'Klik på Anbefal via mail',manual_paging:'Bladring i lærermanualen',manual_zoom:'Zoom i lærermanualen',manual_open:'Åbning af lærermanualens PDF',flower_copy_success:'Egen AI-blomst kopieret til udklipsholderen',explanations:'Forklaringer til AI-blomsten',app_install_success:'App installeret',feedback_success:'Besked sendt via feedbackformularen'};
 window.AI_BLOMSTEN_STATISTIK_LABEL=label=>{
  const text=String(label||''),separator=text.indexOf(' · '),event=separator<0?text:text.slice(0,separator),detail=separator<0?'':text.slice(separator+3);
  let name=events[event]||'Anden registreret handling';
  if(!detail)return name;
  let value=detail;
  if(event==='page')value=pages[detail]||detail;
  if(event==='download_click'){const file=detail.split('/').pop().split('?')[0];value=downloads[file]||file;}
  if(event==='manual_paging')value=detail==='book-next'?'Næste side':detail==='book-prev'?'Forrige side':detail;
  if(event==='explanations')value=detail==='on'?'Slået til':detail==='off'?'Slået fra':detail;
  if(event==='feedback_success')value=detail==='Feedback'?'Feedback på AI-blomsten':detail==='Teknisk fejl'?'Indrapportering af teknisk fejl':detail;
  if(event==='leaf')value=value.replace(/^(Vælg|Fravælg|Markér|Marker)\s+/i,'');
  return name+': '+value;
 };
})();
