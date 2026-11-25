// Deploy the exact artifact returned by upload-pages-artifact. Avoid a second,
// eventually-consistent artifact-name lookup. Uses the existing job's Pages/OIDC grants.
module.exports=async function deployPages({github,context,core,artifactId,wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))}){
 if(!/^\d+$/.test(String(artifactId))||Number(artifactId)<=0)throw Error('Missing uploaded Pages artifact ID');
 const repo={owner:context.repo.owner,repo:context.repo.repo};
 const oidc=await core.getIDToken();
 const {data:deployment}=await github.request('POST /repos/{owner}/{repo}/pages/deployments',{
  ...repo,artifact_id:Number(artifactId),pages_build_version:context.sha,oidc_token:oidc
 });
 const deploymentId=String(deployment.id||deployment.status_url?.split('/').pop()||'');
 if(!deploymentId)throw Error('GitHub did not return a Pages deployment ID');
 const failed=new Set(['deployment_failed','deployment_perms_error','deployment_content_failed','deployment_cancelled','deployment_lost']);
 for(let attempt=0;attempt<60;attempt++){
  const {data:status}=await github.request('GET /repos/{owner}/{repo}/pages/deployments/{pages_deployment_id}',{...repo,pages_deployment_id:deploymentId});
  if(status.status==='succeed'){
   const url=deployment.page_url||`https://${repo.owner}.github.io/${repo.repo}/`;
   core.setOutput('page_url',url);core.info('Pages deployment completed for '+context.sha);return url;
  }
  if(failed.has(status.status))throw Error('Pages deployment failed: '+status.status);
  await wait(5000);
 }
 await github.request('POST /repos/{owner}/{repo}/pages/deployments/{pages_deployment_id}/cancel',{...repo,pages_deployment_id:deploymentId}).catch(()=>{});
 throw Error('Pages deployment did not complete within five minutes');
};
