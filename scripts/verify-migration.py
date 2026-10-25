import concurrent.futures, json, urllib.request, urllib.error
from pathlib import Path
BASES=['https://ibstuff28.vercel.app','https://worlddebatecollective-prep.web.app']
ROUTES=['/','/past-papers','/past-papers/workspace','/history','/sat','/sat/practice/exam','/sat/practice/drill','/amc12','/amc12/practice?mode=mock&n=2','/amc12/polynomials','/amc12/study-plan','/thinkib','/savemyexams','/math-mocks','/exemplars','/pdf.worker.min.mjs']
def check(url):
 try:
  with urllib.request.urlopen(url,timeout=40) as r:
   body=r.read(); ct=r.headers.get('Content-Type','')
   ok=r.status==200
   if '/amc12/polynomials' in url:ok=ok and b'katex-mathml' in body and b'katex-error' not in body
   if 'pdf.worker' in url:ok=ok and ('javascript' in ct)
   if url.endswith('/'):
    brand='wdc' if 'prep.web.app' in url else 'archive';ok=ok and f'data-brand="{brand}"'.encode() in body
   return {'url':url,'ok':ok,'status':r.status,'bytes':len(body)}
 except Exception as e:return {'url':url,'ok':False,'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: results=list(pool.map(check,[b+r for b in BASES for r in ROUTES]))
origin=BASES[1]
for route,method in [('/api/sat/questions?section=math&limit=1','GET'),('/api/sat/exam','OPTIONS')]:
 req=urllib.request.Request(BASES[0]+route,method=method,headers={'Origin':origin,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'})
 try:
  with urllib.request.urlopen(req,timeout=40) as r:results.append({'url':req.full_url,'method':method,'ok':r.headers.get('Access-Control-Allow-Origin')==origin,'status':r.status})
 except Exception as e:results.append({'url':req.full_url,'ok':False,'error':str(e)})
for base in BASES:
 req=urllib.request.Request(base+'/vault/ib-booklets/Math_AA_Formula_Booklet.pdf',headers={'Range':'bytes=0-31'})
 try:
  with urllib.request.urlopen(req,timeout=40) as r:results.append({'url':req.full_url,'ok':r.read(5)==b'%PDF-','status':r.status})
 except Exception as e:results.append({'url':req.full_url,'ok':False,'error':str(e)})
(Path(__file__).resolve().parents[2]/'learn-release-evidence/migration-public-checks.json').write_text(json.dumps(results,indent=2))
failed=[r for r in results if not r['ok']]
print(json.dumps({'passed':len(results)-len(failed),'failed':failed}))
raise SystemExit(bool(failed))
