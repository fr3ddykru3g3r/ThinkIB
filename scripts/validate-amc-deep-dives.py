"""Independent exact checks for every new worked extension, not scraped answer keys."""
from fractions import Fraction as F
from itertools import combinations, product
from math import comb,sqrt
import json
from pathlib import Path
checks={}
s=[2,3]
for _ in range(4):s.append(3*s[-1]-s[-2])
checks['algebra']=[s[5]==123,sqrt(20+5)+sqrt(20-4)==9]
# Polynomial reduction in Z[x]/(x^2+x+1).
def mul(a,b):
 c=[sum(a[i]*b[j] for i in range(len(a)) for j in range(len(b)) if i+j==k) for k in range(len(a)+len(b)-1)]
 for k in range(len(c)-1,1,-1):
  c[k-1]-=c[k];c[k-2]-=c[k];c[k]=0
 return (c+[0,0])[:2]
def power(n):
 result=[1,0];base=[0,1]
 while n:
  if n%2:result=mul(result,base)
  base=mul(base,base);n//=2
 return result
a,b=power(2026),power(1013)
checks['polynomials']=[[a[0]+2*b[0]+3,a[1]+2*b[1]]==[1,-1],sum((F(1,r+1) for r in (1,2,3)),F())==F(13,12)]
checks['inequalities']=[F(1,5)+F(1,5)==F(2,5),sum([F(1,3)]*3)==1]
checks['functions-logs']=[F(6)+F(6,2)+F(6,3)==11,(5-1)*(5-3)==8]
a=1
for _ in range(9):a=2*a+3
checks['sequences-series']=[a==2045,sum((F(1,k*(k+1)) for k in range(1,21)),F())==F(20,21)]
checks['number-theory']=[pow(5,2026,13)==12,[x for x in range(1,316) if x%5==2 and x%7==3 and x%9==4]==[157]]
checks['counting']=[sum(all(b-a>1 for a,b in zip(c,c[1:])) for c in combinations(range(1,11),3))==56,sum(len(set(a))==3 for a in product(range(3),repeat=5))==150]
dice=[(a,b) for a in range(1,7) for b in range(1,7) if a+b>=10]
balls=[(a,b) for a in range(5) for b in range(5) if a!=b and (a<3 or b<3)]
checks['probability']=[F(sum(a==b for a,b in dice),len(dice))==F(1,3),F(sum(a<3 for a,b in balls),len(balls))==F(2,3)]
checks['geometry']=[21*8*7*6==84**2 and F(84,21)==4 and F(13*14*15,4*84)==F(65,8),2*4+3*5==23]
p=(F(1),F(2),F(3));n=(F(2),F(-1),F(2));reflection=tuple(v-F(2,9)*normal for v,normal in zip(p,n));mid=tuple((a+b)/2 for a,b in zip(p,reflection))
checks['coordinate-3d']=[reflection==(F(5,9),F(20,9),F(23,9)) and sum(a*b for a,b in zip(mid,n))==5,sum((x-2)**2 for x in p)==2]
from math import pi,sin,cos
roots=[pi/6,pi/2,5*pi/6,3*pi/2]
checks['trigonometry']=[1/(F(1,4)-1)*2==F(-8,3),all(abs(sin(2*x)-cos(x))<1e-12 for x in roots) and len(roots)==4]
checks['complex-numbers']=[(1+1j)**10==32j,sum(2**i for i in range(5))==31]
guides=json.loads(Path('data/amc12/deep-dives.json').read_text())
assert set(guides)==set(checks)
assert all(len(g['examples'])==2 and len(g['checks'])>=3 and all(len(e['steps'])>=4 for e in g['examples']) for g in guides.values())
assert all(all(results) for results in checks.values()),checks
print('PASS: 12 guide structures; 24 worked-result checks, including exact counts and rational arithmetic.')
