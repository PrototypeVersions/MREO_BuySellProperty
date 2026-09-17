from pathlib import Path

ui = Path("mreo-ui.js")
text = ui.read_text()

start_marker = ' const mediaInput=$("property-media");'
end_marker = ' const toggle='
start = text.find(start_marker)
end = text.find(end_marker, start)
if start == -1 or end == -1:
    raise SystemExit("seller media block markers not found")

new_block = ''' const mediaInput=$("property-media");
 if(mediaInput){
  const uploadArea=mediaInput.closest(".upload-area"),note=uploadArea?.querySelector(".upload-note");
  mediaInput.classList.add("seller-media-native-input");
  mediaInput.setAttribute("aria-label","Add photos or videos");
  const picker=document.createElement("div");
  picker.className="seller-media-picker";
  picker.innerHTML='<div class="seller-media-picker-toolbar"><button type="button" class="primary-button button-blue seller-media-add">Add photos or videos</button><span class="seller-media-count" aria-live="polite">No files selected</span></div><div class="seller-media-preview-grid" hidden></div>';
  mediaInput.insertAdjacentElement("afterend",picker);
  const addButton=picker.querySelector(".seller-media-add"),countLabel=picker.querySelector(".seller-media-count"),grid=picker.querySelector(".seller-media-preview-grid");
  let previewUrls=[];
  const keyFor=file=>[file.name,file.size,file.lastModified,file.type].join("|");
  const clearPreviewUrls=()=>{previewUrls.forEach(url=>URL.revokeObjectURL(url));previewUrls=[];};
  const renderMediaSelection=()=>{
   clearPreviewUrls();grid.innerHTML="";
   const imageCount=selectedMediaFiles.filter(file=>(file.type||"").startsWith("image/")).length;
   const videoCount=selectedMediaFiles.filter(file=>(file.type||"").startsWith("video/")).length;
   if(!selectedMediaFiles.length){
    countLabel.textContent="No files selected";
    grid.hidden=true;
    if(note)note.textContent="Add photos or videos. You can add more files in separate selections.";
    return;
   }
   countLabel.textContent=selectedMediaFiles.length+" file"+(selectedMediaFiles.length===1?"":"s")+" selected · "+imageCount+" image"+(imageCount===1?"":"s")+" · "+videoCount+" video"+(videoCount===1?"":"s");
   if(note)note.textContent="Choose Add photos or videos again to add more. Remove any item you do not want to submit.";
   selectedMediaFiles.forEach((file,index)=>{
    const card=document.createElement("article");
    card.className="seller-media-preview-card";
    const visual=document.createElement("div");
    visual.className="seller-media-preview-visual";
    if((file.type||"").startsWith("image/")){
     const img=document.createElement("img"),url=URL.createObjectURL(file);previewUrls.push(url);img.src=url;img.alt="Preview of "+file.name;visual.appendChild(img);
    }else{
     visual.classList.add("seller-media-video-thumb");
     visual.innerHTML='<span class="seller-media-play" aria-hidden="true">▶</span><span>VIDEO</span>';
    }
    const meta=document.createElement("div");
    meta.className="seller-media-preview-meta";
    const name=document.createElement("span");
    name.className="seller-media-preview-name";name.textContent=file.name;name.title=file.name;
    const remove=document.createElement("button");
    remove.type="button";remove.className="seller-media-remove";remove.textContent="Remove";remove.setAttribute("aria-label","Remove "+file.name);
    remove.addEventListener("click",()=>{selectedMediaFiles.splice(index,1);renderMediaSelection();});
    meta.append(name,remove);card.append(visual,meta);grid.appendChild(card);
   });
   grid.hidden=false;
  };
  addButton.addEventListener("click",()=>{mediaInput.value="";mediaInput.click();});
  mediaInput.addEventListener("change",()=>{
   const incoming=[...(mediaInput.files||[])];
   const seen=new Set(selectedMediaFiles.map(keyFor));
   for(const file of incoming){const key=keyFor(file);if(!seen.has(key)){selectedMediaFiles.push(file);seen.add(key);}}
   mediaInput.value="";
   renderMediaSelection();
  });
  renderMediaSelection();
 }
'''
text = text[:start] + new_block + text[end:]
ui.write_text(text)

css = Path("marketplace.css")
css_text = css.read_text()
marker = "/* Seller media picker */"
styles = '''/* Seller media picker */
.seller-media-native-input{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
.seller-media-picker{margin-top:14px}
.seller-media-picker-toolbar{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.seller-media-count{font-size:13px;font-weight:700;color:var(--muted)}
.seller-media-preview-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-top:16px}
.seller-media-preview-card{min-width:0;border:1px solid var(--line);background:rgba(255,255,255,.48)}
.seller-media-preview-visual{aspect-ratio:4/3;overflow:hidden;background:#e8e4d8;display:grid;place-items:center}
.seller-media-preview-visual img{display:block;width:100%;height:100%;object-fit:cover}
.seller-media-video-thumb{align-content:center;justify-items:center;gap:6px;color:var(--ink);font-size:11px;font-weight:800;letter-spacing:.08em}
.seller-media-play{display:grid;place-items:center;width:42px;height:42px;border-radius:50%;background:var(--ink);color:#fff;font-size:17px;padding-left:2px;letter-spacing:0}
.seller-media-preview-meta{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:8px;padding:9px 10px}
.seller-media-preview-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}
.seller-media-remove{border:0;background:transparent;color:var(--blue);font-size:11px;font-weight:800;padding:4px;cursor:pointer}
.seller-media-remove:hover,.seller-media-remove:focus-visible{text-decoration:underline}
@media(max-width:600px){.seller-media-preview-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.seller-media-picker-toolbar .primary-button{width:100%}.seller-media-count{width:100%}}
'''
if marker in css_text:
    css_text = css_text[:css_text.find(marker)].rstrip() + "\n\n" + styles
else:
    css_text = css_text.rstrip() + "\n\n" + styles
css.write_text(css_text)

seller = Path("seller.html")
s = seller.read_text()
for old in [
    "marketplace.css?v=20260914-blind-auction",
    "marketplace.css?v=20260917-media-picker",
    "marketplace.css?v=20260917-seller-media-picker",
]:
    s = s.replace(old, "marketplace.css?v=20260917-seller-media-picker")
for old in [
    "mreo-ui.js?v=20260914-blind-auction",
    "mreo-ui.js?v=20260917-media-accumulate",
    "mreo-ui.js?v=20260917-seller-media-picker",
]:
    s = s.replace(old, "mreo-ui.js?v=20260917-seller-media-picker")
seller.write_text(s)
