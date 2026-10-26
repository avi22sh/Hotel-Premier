/* Shared guest quantity controls. Form values stay local until the guest sends an enquiry. */
(() => {
 'use strict';
 const scope='#concierge-booking-modal,#group-stay-enquiry,#restaurant-event-form';
 const say=value=>window.HotelGuestLanguage?.text(value)||value;
 function error(input){
  if(!/^\d+$/.test(input.value)||!Number.isSafeInteger(Number(input.value)))return 'Enter a whole number.';
  const n=Number(input.value),min=Number(input.min||0),max=input.max===''?Infinity:Number(input.max);
  if(n<min||n>max)return `Choose a number from ${min} to ${Number.isFinite(max)?max:'the allowed maximum'}.`;
  return '';
 }
 function showError(input){
  const message=error(input);input.setCustomValidity(message);input.setAttribute('aria-invalid',String(Boolean(message)));
  const status=document.getElementById(input.dataset.quantityError);if(status)status.textContent=say(message);
  return !message;
 }
 function visible(input){return !input.disabled&&!input.closest('[hidden]');}
 function validateNumbers(root){
  if(!root)return true;
  let first;
  for(const input of root.querySelectorAll('input[type="number"]'))if(visible(input)&&!showError(input))first ||= input;
  if(first){const details=first.closest('details');if(details)details.open=true;first.focus({preventScroll:true});first.scrollIntoView({block:'nearest',behavior:'auto'});return false;}
  return true;
 }
 function refresh(){
  for(const input of document.querySelectorAll('.quantity-stepper input')){
   const wrap=input.parentElement,value=Number(input.value),min=Number(input.min||0),max=input.max===''?Infinity:Number(input.max);
   wrap.querySelector('[data-quantity-minus]').disabled=input.disabled||input.value!==''&&value<=min;
   wrap.querySelector('[data-quantity-plus]').disabled=input.disabled||input.value!==''&&value>=max;
  }
  const form=document.getElementById('restaurant-event-form');
  if(form){const submit=form.querySelector('button[type="submit"]');if(submit)submit.disabled=[...form.querySelectorAll('input[type="number"]')].some(input=>Boolean(error(input)));}
 }
 function wrapNumbers(){
  for(const root of document.querySelectorAll(scope))for(const input of root.querySelectorAll('input[type="number"]')){
   if(input.closest('.quantity-stepper'))continue;
   const label=input.labels?.[0];if(label&&!label.id)label.id='quantity-label-'+input.id;
   const wrap=document.createElement('div');wrap.className='quantity-stepper';wrap.setAttribute('role','group');
   if(label)wrap.setAttribute('aria-labelledby',label.id);
   input.parentNode.insertBefore(wrap,input);wrap.append(input);input.inputMode='numeric';
   const status=document.createElement('small');status.className='quantity-error';status.id='quantity-error-'+input.id;status.setAttribute('aria-live','polite');
   input.dataset.quantityError=status.id;input.setAttribute('aria-describedby',[input.getAttribute('aria-describedby'),status.id].filter(Boolean).join(' '));wrap.after(status);
   for(const delta of [-1,1]){
    const button=document.createElement('button');button.type='button';button.textContent=delta<0?'−':'+';button.setAttribute('aria-label',delta<0?'Decrease quantity':'Increase quantity');
    button.dataset[delta<0?'quantityMinus':'quantityPlus']='';
    button.addEventListener('click',()=>{
     const min=Number(input.min||0),max=input.max===''?Number.MAX_SAFE_INTEGER:Number(input.max),step=Number(input.step)||1;
     const current=/^\d+$/.test(input.value)?Number(input.value):min-delta*step;
     input.value=String(Math.min(max,Math.max(min,current+delta*step)));
     input.setCustomValidity('');input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));refresh();
    });
    if(delta<0)wrap.prepend(button);else wrap.append(button);
   }
  }
  refresh();
  const today=window.app?.hotelToday?.();
  if(today)for(const id of ['calc-arrival-date','restaurant-event-date']){const date=document.getElementById(id);if(date)date.min=today;}
 }
 function init(){
  wrapNumbers();
  new MutationObserver(records=>{if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&!n.closest?.('.quantity-stepper,.quantity-error'))))wrapNumbers();}).observe(document.body,{subtree:true,childList:true});
  document.addEventListener('input',event=>{
   const input=event.target;if(!input.matches?.('.quantity-stepper input'))return;
   if(!showError(input)){
    // Preserve incomplete manual input instead of letting inline calculators clamp it.
    event.stopImmediatePropagation();
    for(const button of input.closest(scope)?.querySelectorAll('#group-stay-send,#booking-send-enquiry,button[type="submit"]')||[])button.disabled=true;
   }
   queueMicrotask(refresh);
  },true);
  document.addEventListener('change',()=>queueMicrotask(()=>{refresh();for(const input of document.querySelectorAll('.quantity-stepper input[aria-invalid="true"]'))showError(input);}));
  document.addEventListener('change',event=>{
   if(event.target.matches?.('.quantity-stepper input')&&!showError(event.target))event.stopImmediatePropagation();
  },true);
  window.addEventListener('pageshow',wrapNumbers);
 }
 async function shareLink(url){
  try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(url);window.app?.showToast(say('Link copied. Share it in any app.'),'success');return;}}catch{}
  const dialog=document.createElement('dialog');dialog.className='share-link-dialog';dialog.setAttribute('aria-label',say('Share Hotel Premier website'));
  const title=document.createElement('h3');title.textContent=say('Share Hotel Premier website');
  const field=document.createElement('input');field.value=url;field.readOnly=true;field.setAttribute('aria-label',say('Website link'));field.addEventListener('click',()=>field.select());
  const close=document.createElement('button');close.type='button';close.textContent=say('Close');close.addEventListener('click',()=>dialog.close());
  const help=document.createElement('p');help.textContent=say('Select and copy this link to share it.');
  dialog.append(title,field,help,close);dialog.addEventListener('close',()=>dialog.remove());document.body.append(dialog);dialog.showModal();
 }
 window.HotelGuestForms=Object.freeze({validateNumbers,refresh,shareLink,numberError:error});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
