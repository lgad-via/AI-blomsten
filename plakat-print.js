(() => {
 document.querySelectorAll('[data-print-poster]').forEach(button=>button.addEventListener('click',()=>{
  const status=document.getElementById('poster-print-status');
  const frame=document.createElement('iframe');frame.style.cssText='position:fixed;width:1px;height:1px;left:-10000px;border:0';document.body.append(frame);
  const doc=frame.contentDocument;doc.open();doc.write('<!doctype html><html lang="da"><head><title>AI-blomsten – plakat</title><style>@page{size:A4 portrait;margin:0}html,body{margin:0}img{display:block;width:100%;height:auto;max-height:297mm;object-fit:contain}</style></head><body><img alt="AI-blomsten – plakat"></body></html>');doc.close();
  const img=doc.querySelector('img');button.disabled=true;status.textContent='Klargør plakaten til udskrivning…';
  img.onload=()=>{button.disabled=false;status.textContent='Gem efterfølgende din egen plakat, eller udskriv den her fra siden';frame.contentWindow.focus();frame.contentWindow.print();};
  img.onerror=()=>{button.disabled=false;status.textContent='Plakaten kunne ikke indlæses. Prøv igen.';frame.remove();};
  frame.contentWindow.addEventListener('afterprint',()=>frame.remove(),{once:true});img.src=new URL(button.dataset.printPoster,location.href).href;
 }));
})();
