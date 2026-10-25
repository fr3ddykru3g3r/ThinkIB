"""Stage a static WDC edition without touching the IB deployment/source checkout."""
from pathlib import Path
import shutil, subprocess, json
root=Path(__file__).resolve().parents[1]
stage=root.parent/'firebase-learn-build'
stage.mkdir(exist_ok=True)
for name in ['app','lib','data','public']:
 subprocess.run(['rsync','-a','--delete',str(root/name)+'/',str(stage/name)+'/'],check=True)
(stage/'scripts').mkdir(exist_ok=True)
shutil.copy2(root/'scripts/copy-pdf-worker.cjs',stage/'scripts/copy-pdf-worker.cjs')
for name in ['package.json','package-lock.json','tsconfig.json','next-env.d.ts']:
 shutil.copy2(root/name,stage/name)
if not (stage/'node_modules').exists(): (stage/'node_modules').symlink_to('../learning-platform/node_modules',target_is_directory=True)
shutil.rmtree(stage/'app/api')
(stage/'next.config.js').write_text("module.exports = { output:'export', trailingSlash:false, images:{unoptimized:true}, poweredByHeader:false };\n")
# Static Hosting contains the public resource files; dynamic requests use the shared public API.
(root.parent/'firebase.learn.json').write_text(json.dumps({'hosting':{'site':'worlddebatecollective-prep','public':'firebase-learn-build/out','ignore':['firebase.json','**/.*','**/node_modules/**'],'cleanUrls':True,'headers':[{'source':'/vault/**','headers':[{'key':'Access-Control-Allow-Origin','value':'*'},{'key':'Access-Control-Expose-Headers','value':'Content-Length, Content-Range, Accept-Ranges'},{'key':'Cache-Control','value':'public,max-age=86400'}]},{'source':'/local-vault/**','headers':[{'key':'Access-Control-Allow-Origin','value':'*'},{'key':'Access-Control-Expose-Headers','value':'Content-Length, Content-Range, Accept-Ranges'},{'key':'Cache-Control','value':'public,max-age=86400'}]},{'source':'/pdf.worker.min.mjs','headers':[{'key':'Content-Type','value':'text/javascript'},{'key':'Cache-Control','value':'public,max-age=86400'}]},{'source':'/_next/static/**','headers':[{'key':'Cache-Control','value':'public,max-age=31536000,immutable'}]}],'redirects':[{'source':'/amc-aime{,/**}','destination':'/amc12','type':301}]}},indent=2))
print(stage)
