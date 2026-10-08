const $ = s => document.querySelector(s);
const rowsEl = $('#rows');
const toast = $('#toast');
let rows = JSON.parse(localStorage.getItem('tannspoof_rows') || '[]');
let deferredInstall = null;

function normId(v){
  const m = String(v||'').match(/(?:rbxassetid:\/\/)?(\d{3,})/);
  return m ? m[1] : '';
}
function assetId(v){ const id = normId(v); return id ? `rbxassetid://${id}` : ''; }
function unique(arr){ return [...new Set(arr.filter(Boolean))]; }
function save(){ localStorage.setItem('tannspoof_rows', JSON.stringify(rows)); render(); }
function showToast(t){ toast.textContent=t; toast.classList.add('show'); clearTimeout(showToast.t); showToast.t=setTimeout(()=>toast.classList.remove('show'),1800); }
function escapeLuau(s){ return String(s).replace(/\\/g,'\\\\').replace(/"/g,'\\"'); }

function render(){
  $('#heroCount').textContent=rows.length;
  if(!rows.length){ rowsEl.innerHTML='<div class="empty">No IDs yet. Paste IDs above and click <b>Parse IDs</b>.</div>'; return; }
  rowsEl.innerHTML='';
  rows.forEach((r,i)=>{
    const el=document.createElement('div'); el.className='row';
    el.innerHTML=`<div class="num">${i+1}</div>
      <input class="text-input source" data-i="${i}" data-k="source" value="${r.source||''}" aria-label="Source ID">
      <input class="text-input target" data-i="${i}" data-k="target" value="${r.target||$('#targetId').value||''}" aria-label="Target ID">
      <button class="secondary preview-action" data-preview="${i}">Preview</button>
      <button class="small-btn danger remove-action" data-remove="${i}">×</button>`;
    rowsEl.appendChild(el);
  });
  rowsEl.querySelectorAll('input[data-k]').forEach(input=>input.addEventListener('input',e=>{const i=+e.target.dataset.i; rows[i][e.target.dataset.k]=e.target.value; localStorage.setItem('tannspoof_rows',JSON.stringify(rows));}));
  rowsEl.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{rows.splice(+b.dataset.remove,1);save();});
  rowsEl.querySelectorAll('[data-preview]').forEach(b=>b.onclick=()=>copyPreview(+b.dataset.preview));
}

$('#parseBtn').onclick=()=>{
  const ids=unique($('#sourceIds').value.split(/[\n,;\s]+/).map(normId));
  rows=ids.map(id=>({source:id,target:$('#targetId').value.trim()})); save(); showToast(`${ids.length} IDs parsed`);
};
$('#sampleBtn').onclick=()=>{$('#sourceIds').value='1234567890\n9876543210\n5555555555';$('#targetId').value='1111111111';$('#parseBtn').click();};
$('#clearIds').onclick=()=>{$('#sourceIds').value='';rows=[];save();};
$('#targetId').addEventListener('input',()=>{rows.forEach(r=>{if(!r.target)r.target=$('#targetId').value;});localStorage.setItem('tannspoof_rows',JSON.stringify(rows));});
$('#globalMode').onchange=e=>showToast(e.target.checked?'Global mode ON':'Mapping mode ON');
$('#addRow').onclick=()=>{rows.push({source:'',target:$('#targetId').value.trim()});save();};

function globalScript(){
  const target=normId($('#targetId').value);
  return `-- TannSpoof • GLOBAL Animation Spoof\n-- credit by tannn\nlocal TARGET_ID = "${escapeLuau(target)}"\nassert(TARGET_ID:match("^%d+$"), "Set a numeric TARGET_ID first")\nlocal NEW_ID = "rbxassetid://" .. TARGET_ID\nlocal changed = 0\nfor _, inst in ipairs(game:GetDescendants()) do\n    if inst:IsA("Animation") then\n        if inst.AnimationId ~= NEW_ID then\n            inst.AnimationId = NEW_ID\n            changed += 1\n        end\n    end\nend\nprint(("[TannSpoof] Replaced %d Animation objects with %s"):format(changed, NEW_ID))`;
}
function mappingScript(){
  const map=rows.map(r=>[normId(r.source),normId(r.target)]).filter(([a,b])=>a&&b);
  const lines=map.map(([a,b])=>`    ["rbxassetid://${a}"] = "rbxassetid://${b}",`).join('\n');
  return `-- TannSpoof • MAPPING Animation IDs\n-- credit by tannn\nlocal MAP = {\n${lines}\n}\nlocal changed = 0\nfor _, inst in ipairs(game:GetDescendants()) do\n    if inst:IsA("Animation") then\n        local replacement = MAP[inst.AnimationId]\n        if replacement and inst.AnimationId ~= replacement then\n            inst.AnimationId = replacement\n            changed += 1\n        end\n    end\nend\nprint(("[TannSpoof] Mapped %d Animation objects"):format(changed))`;
}
function previewScript(id){
 const rid=normId(id)||normId($('#targetId').value);
 return `-- TannSpoof • STUDIO PREVIEW\n-- Select an R6/R15 rig or model containing a Humanoid/AnimationController.\nlocal Selection = game:GetService("Selection")\nlocal selected = Selection:Get()\nassert(#selected > 0, "Select a rig/model in Explorer first")\nlocal model = selected[1]\nlocal animationId = "rbxassetid://${rid}"\nlocal animator\nlocal humanoid = model:FindFirstChildOfClass("Humanoid")\nif humanoid then\n    animator = humanoid:FindFirstChildOfClass("Animator") or Instance.new("Animator", humanoid)\nelse\n    local controller = model:FindFirstChildOfClass("AnimationController") or Instance.new("AnimationController", model)\n    animator = controller:FindFirstChildOfClass("Animator") or Instance.new("Animator", controller)\nend\nfor _, track in ipairs(animator:GetPlayingAnimationTracks()) do track:Stop(0.1) end\nlocal animation = Instance.new("Animation")\nanimation.AnimationId = animationId\nlocal track = animator:LoadAnimation(animation)\ntrack.Looped = true\ntrack:Play(0.15)\nprint("[TannSpoof] Previewing " .. animationId)`;
}

async function copyText(text){ await navigator.clipboard.writeText(text); showToast('Copied to clipboard'); }
$('#copyGlobalScript').onclick=async()=>{const t=globalScript(); if(!normId($('#targetId').value)){showToast('Enter a target ID first');return;} await copyText(t);};
$('#copyMapScript').onclick=async()=>{if(!rows.some(r=>normId(r.source)&&normId(r.target))){showToast('Add at least one mapping');return;} await copyText(mappingScript());};
$('#downloadScript').onclick=()=>{const t=globalScript(); const blob=new Blob([t],{type:'text/plain'}); const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='TannSpoof_GlobalSpoof.lua';a.click();URL.revokeObjectURL(a.href);showToast('Lua downloaded');};
function copyPreview(i){ const id= i==null ? ($('#targetId').value||rows[0]?.target||rows[0]?.source) : (rows[i]?.target||rows[i]?.source); if(!normId(id)){showToast('Enter or select an animation ID');return;} copyText(previewScript(id)); }
$('#copyPreviewScript').onclick=()=>copyPreview(null);
$('#openRoblox').onclick=()=>{const id=normId($('#targetId').value)||normId(rows[0]?.target)||normId(rows[0]?.source); if(!id){showToast('Enter an animation ID');return;} window.open(`https://www.roblox.com/catalog/${id}`,'_blank','noopener,noreferrer');};

$('#transformBtn').onclick=()=>{
  let code=$('#sourceCode').value;
  if(!code.trim()){showToast('Paste some Luau first');return;}
  const pairs=rows.map(r=>[normId(r.source),normId(r.target)]).filter(([a,b])=>a&&b);
  if(!pairs.length){const target=normId($('#targetId').value); if(!target){showToast('Add a mapping or target');return;} code=code.replace(/rbxassetid:\/\/(\d+)/g,`rbxassetid://${target}`);}
  else for(const [a,b] of pairs){ const re=new RegExp(`rbxassetid:\\/\\/${a}(?!\\d)`,'g'); code=code.replace(re,`rbxassetid://${b}`); const raw=new RegExp(`(?<!\\d)${a}(?!\\d)`,'g'); code=code.replace(raw,b); }
  $('#sourceCode').value=code; showToast('Source transformed');
};
$('#copyCode').onclick=async()=>{if(!$('#sourceCode').value.trim()){showToast('Nothing to copy');return;} await copyText($('#sourceCode').value);};

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('#installBtn').classList.remove('hidden');});
$('#installBtn').onclick=async()=>{if(!deferredInstall)return;deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$('#installBtn').classList.add('hidden');};
$('#themeBtn').onclick=()=>document.body.classList.toggle('compact');
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();
