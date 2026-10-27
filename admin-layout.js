// Shared table semantics and small-screen cards for all existing admin managers.
(() => {
 'use strict';
 let scheduled=false;
 function enhance(){
  scheduled=false;
  for(const table of document.querySelectorAll('#admin-tab-content table')){
   table.classList.add('admin-responsive-table');
   const headers=[...table.querySelectorAll('thead th')].map(th=>{th.scope='col';return th.textContent.trim();});
   for(const row of table.querySelectorAll('tbody tr'))[...row.children].forEach((cell,index)=>{
    if(!cell.dataset.label)cell.dataset.label=headers[index]||'Details';
    for(const input of cell.querySelectorAll('input,select,textarea'))if(!input.hasAttribute('aria-label')&&!input.labels?.length)input.setAttribute('aria-label',headers[index]||'Item details');
   });
  }
 }
 function init(){
  const host=document.getElementById('admin-tab-content');if(!host)return;
  window.addEventListener('hp-content-saved',()=>{
   const status=document.querySelector('.admin-save-scope');
   if(status)status.textContent='Saved on this device · Public site changes after reviewed GitHub publishing.';
  });
  new MutationObserver(()=>{if(!scheduled){scheduled=true;requestAnimationFrame(enhance);}}).observe(host,{subtree:true,childList:true});
  enhance();
  window.addEventListener('hp-storage-pressure',()=>{
   if(!window.admin?.isAuthenticated)return;
   let notice=document.getElementById('storage-backup-notice');if(notice)return;
   notice=document.createElement('aside');notice.id='storage-backup-notice';notice.className='local-publish-card';notice.setAttribute('role','alert');
   const text=document.createElement('p');text.textContent='Storage is low. Export a backup before freeing space. Your earlier photo has been kept.';
   const backup=document.createElement('button');backup.type='button';backup.className='btn-primary';backup.textContent='Export backup';backup.addEventListener('click',()=>window.admin.exportFullBackup());
   const dismiss=document.createElement('button');dismiss.type='button';dismiss.className='studio-button';dismiss.textContent='Dismiss';dismiss.addEventListener('click',()=>notice.remove());
   notice.append(text,backup,dismiss);host.prepend(notice);
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
