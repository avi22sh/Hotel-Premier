(() => {
 'use strict';
 let pending=Promise.resolve();
 function ask(message,wantsText=false) {
  const show=()=>new Promise(resolve=>{
   const dialog=document.createElement('dialog');dialog.className='photo-crop-dialog';dialog.setAttribute('aria-label',wantsText?'Admin text entry':'Confirm admin action');
   const text=document.createElement('p');text.textContent=String(message);
   const input=wantsText?document.createElement('input'):null;
   dialog.append(text);
   if(input){input.type='text';input.maxLength=120;input.className='form-input';input.setAttribute('aria-label',String(message));dialog.append(input);}
   const actions=document.createElement('div');actions.className='photo-crop-actions';
   let finished=false;
   const finish=value=>{if(finished)return;finished=true;dialog.close();dialog.remove();resolve(value);};
   for(const [label,value]of[['Cancel',false],['Continue',true]]){const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('click',()=>finish(wantsText?(value?input.value:null):value));actions.append(button);}
   dialog.addEventListener('cancel',event=>{event.preventDefault();finish(wantsText?null:false);});
   dialog.addEventListener('close',()=>{if(!finished)finish(wantsText?null:false);});
   dialog.append(actions);document.body.append(dialog);dialog.showModal();input?.focus();
  });
  const result=pending.then(show);pending=result.catch(()=>{});return result;
 }
 window.HotelDialogs=Object.freeze({confirm:message=>ask(message),prompt:message=>ask(message,true)});
})();
