(()=>{
const root=document.documentElement,button=document.getElementById('theme-toggle');
function apply(dark){root.dataset.theme=dark?'dark':'light';button.setAttribute('aria-pressed',String(dark));button.setAttribute('aria-label',dark?'Skift til lys tilstand':'Skift til mørk tilstand');button.title=dark?'Skift til lys tilstand':'Skift til mørk tilstand';}
apply(root.dataset.theme==='dark');
button.addEventListener('click',()=>{const dark=root.dataset.theme!=='dark';apply(dark);try{localStorage.setItem('ai-theme',dark?'dark':'light')}catch{}});
})();
