(() => {
 const poster=document.getElementById('poster'),editor=document.getElementById('editor'),status=document.getElementById('status');
 const buttons=[document.getElementById('download'),document.getElementById('print')];
 // Safe text rectangles stay inside the rounded bubbles and above the printed goals.
 const boxes=[
  {name:'Hjælpelæreren',x:.065,y:.105,w:.26,h:.215},
  {name:'Kloge-Åge',x:.38,y:.09,w:.26,h:.19},
  {name:'Træneren',x:.70,y:.035,w:.265,h:.285},
  {name:'Korrekturlæser',x:.068,y:.665,w:.26,h:.26},
  {name:'Sparringspartneren',x:.395,y:.695,w:.25,h:.26},
  {name:'Skrivemaskinen',x:.707,y:.67,w:.255,h:.255}
 ];
 const pointScale=1448/210*25.4/72;
 let active=null,savedRange=null;
 function remember(){const selection=window.getSelection();if(selection.rangeCount&&active&&active.contains(selection.anchorNode))savedRange=selection.getRangeAt(0).cloneRange();}
 document.addEventListener('selectionchange',remember);
 function resize(){const scale=editor.clientWidth/1448;for(const box of boxes){box.input.style.fontSize=(12*pointScale*scale)+'px';box.input.querySelectorAll('[data-size]').forEach(el=>el.style.fontSize=(Number(el.dataset.size)*pointScale*scale)+'px');}}
 for(const box of boxes){
  const input=document.createElement('div');input.className='bubble';input.contentEditable='true';input.setAttribute('role','textbox');input.setAttribute('aria-multiline','true');input.dataset.placeholder='Skriv om '+box.name+'…';input.setAttribute('aria-label','Tekst til '+box.name);input.spellcheck=true;input.style.cssText=`left:${box.x*100}%;top:${box.y*100}%;width:${box.w*100}%;height:${box.h*100}%`;box.input=input;editor.append(input);
  input.addEventListener('focus',()=>{if(active!==input)savedRange=null;active=input;});
  input.addEventListener('input',()=>{input.querySelectorAll('font[size="7"]').forEach(el=>{el.removeAttribute('size');el.dataset.size=document.getElementById('text-size').value;el.style.fontSize=(Number(el.dataset.size)*pointScale*editor.clientWidth/1448)+'px';});status.textContent=input.scrollHeight>input.clientHeight+2?'Teksten fylder mere end boblen. Vælg mindre skrift eller kort teksten ned.':'';remember();});
  input.addEventListener('paste',event=>{event.preventDefault();document.execCommand('insertText',false,event.clipboardData.getData('text/plain'));});
 }
 function apply(command,value){
  if(!active){status.textContent='Klik først i en taleboble.';return;}
  active.focus();const selection=window.getSelection();if(savedRange){selection.removeAllRanges();selection.addRange(savedRange);}
  document.execCommand('styleWithCSS',false,true);
  if(command==='size'){
   document.execCommand('styleWithCSS',false,false);document.execCommand('fontSize',false,'7');
   active.querySelectorAll('font[size="7"]').forEach(el=>{el.removeAttribute('size');el.dataset.size=value;el.style.fontSize=(Number(value)*pointScale*editor.clientWidth/1448)+'px';});
  }else document.execCommand(command,false,value||null);
  remember();
 }
 document.querySelectorAll('[data-format]').forEach(button=>{button.addEventListener('mousedown',event=>event.preventDefault());button.addEventListener('click',()=>apply(button.dataset.format));});
 document.querySelectorAll('[data-color]').forEach(button=>{button.addEventListener('mousedown',event=>event.preventDefault());button.addEventListener('click',()=>{apply('foreColor',button.dataset.color);if(active)document.querySelectorAll('[data-color]').forEach(dot=>dot.setAttribute('aria-pressed',String(dot===button)));});});
 document.getElementById('text-size').addEventListener('change',event=>apply('size',event.target.value));
 function ready(){buttons.forEach(b=>b.disabled=false);status.textContent='';resize();}
 poster.addEventListener('load',ready);poster.addEventListener('error',()=>status.textContent='Plakaten kunne ikke indlæses. Genindlæs siden.');if(poster.complete&&poster.naturalWidth)ready();if(window.ResizeObserver)new ResizeObserver(resize).observe(editor);else window.addEventListener('resize',resize);
 function runs(box){
  const result=[],scale=1448/editor.clientWidth;
  function visit(node){
   if(node.nodeType===3){const style=getComputedStyle(node.parentElement);const font=parseFloat(style.fontSize)*scale;const bold=Number(style.fontWeight)>=600||style.fontWeight==='bold';const italic=style.fontStyle==='italic';let underline=false;for(let el=node.parentElement;el&&el!==box.input.parentElement;el=el.parentElement){if(getComputedStyle(el).textDecorationLine.includes('underline'))underline=true;}
    for(const char of node.textContent)result.push({char,font,bold,italic,underline,color:style.color});
   }else if(node.nodeType===1){if(node.tagName==='BR')result.push({char:'\n'});else{if(['DIV','P'].includes(node.tagName)&&node!==box.input&&result.length&&result[result.length-1].char!=='\n')result.push({char:'\n'});node.childNodes.forEach(visit);}}
  }
  visit(box.input);return result;
 }
 function render(){
  const canvas=document.createElement('canvas');canvas.width=poster.naturalWidth;canvas.height=poster.naturalHeight;const ctx=canvas.getContext('2d');ctx.drawImage(poster,0,0);ctx.textBaseline='alphabetic';
  for(const box of boxes){
   const width=box.w*canvas.width,height=box.h*canvas.height,chars=runs(box);let lines=[],line=[],used=0;
   function flush(){lines.push(line);line=[];used=0;}
   function font(c){return `${c.italic?'italic ':''}${c.bold?'bold ':''}${c.font}px Arial`;}
   for(const c of chars){if(c.char==='\n'){flush();continue;}ctx.font=font(c);c.width=ctx.measureText(c.char).width;
    if(used+c.width>width&&line.length){const space=line.map(v=>v.char).lastIndexOf(' ');if(space>=0){const carry=line.splice(space+1);line.pop();flush();line=carry;used=carry.reduce((sum,v)=>sum+v.width,0);}else flush();}
    if(c.char===' '&&!line.length)continue;line.push(c);used+=c.width;
   }
   if(line.length)flush();let y=0;
   for(const row of lines){const max=(row.length?Math.max(...row.map(c=>c.font)):12*pointScale);if(y+max*1.3>height)throw Error('overflow');y+=max;let x=0;
    for(const c of row){ctx.font=font(c);ctx.fillStyle=c.color;ctx.fillText(c.char,box.x*canvas.width+x,box.y*canvas.height+y);if(c.underline){ctx.fillRect(box.x*canvas.width+x,box.y*canvas.height+y+c.font*.12,c.width,Math.max(1,c.font*.06));}x+=c.width;}y+=max*.3;
   }
  }
  return canvas;
 }
 buttons[0].addEventListener('click',()=>{
  try{render().toBlob(blob=>{
   if(!blob){status.textContent='Plakaten kunne ikke gemmes. Prøv igen.';return;}
   const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Min-AI-blomst-plakat.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);status.textContent='Din plakat er klar til download.';
  },'image/png');}catch(error){status.textContent=error.message==='overflow'?'Teksten fylder mere end en taleboble. Vælg mindre skrift eller kort teksten ned før download.':'Plakaten kunne ikke gemmes. Prøv igen.';}
 });
 buttons[1].addEventListener('click',()=>{
  try{
   const image=document.getElementById('print-poster');
   image.onload=()=>{status.textContent='Gem efterfølgende din egen plakat, eller udskriv den her fra siden';window.print();};
   image.onerror=()=>{status.textContent='Printvisningen kunne ikke indlæses. Prøv igen.';};
   image.src=render().toDataURL('image/png');
  }catch(error){status.textContent=error.message==='overflow'?'Teksten fylder mere end en taleboble. Vælg mindre skrift eller kort teksten ned før udskrivning.':'Plakaten kunne ikke klargøres til udskrivning. Prøv igen.';}
 });
})();
