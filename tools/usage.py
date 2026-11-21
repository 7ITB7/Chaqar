# Builds data/lex/uH.json and uG.json from the word-by-word data in data/il.
# For each Strong's key:  b = [[book index, count], ...]   every occurrence, not capped
#                         e = {era: [[English gloss, count], ...]}  how it was rendered in each era
#                         p = [key, ...]  words it most often shares a verse with (beyond chance)
import json, re, math, collections
META=json.loads(open("meta.js").read().split("=",1)[1].rstrip().rstrip(";"))
IDS=[b[0] for b in META["books"]][:66]
BK=json.load(open("data/books.json"))["books"]
STRIP=set("and the a an in to of from for with as like by at on upon unto into he she they it you i we his her their my your our its him them me us thee thou ye o that which who will shall be is was were are has have had let not do did".split())
def gloss(g):
  g=re.sub(r"(?<=[a-z])[\[<]([a-z]+)[\]>]",r"\1",g.lower())
  g=re.sub(r"\[[^\]]*\]|<[^>]*>|\([^)]*\)","",g)
  g=re.sub(r"[^a-z' -]"," ",g).replace("-"," ").split()
  while len(g)>1 and g[0] in STRIP: g.pop(0)
  while len(g)>1 and g[-1] in STRIP: g.pop()
  return " ".join(g)
for L in "HG":
  books=[i for i,b in enumerate(IDS) if (i<39)==(L=="H")]
  cnt=collections.defaultdict(collections.Counter); gl=collections.defaultdict(lambda:collections.defaultdict(collections.Counter))
  verses=[]
  for bi in books:
    era=BK[IDS[bi]]["e"]
    for ch in json.load(open(f"data/il/{IDS[bi]}.json")):
      for v in ch:
        ks=set()
        for w in v:
          k=w[3] if len(w)>3 else None
          if not k or not re.match(r"^[HG]\d{4}[A-Z]?$",k): continue
          cnt[k][bi]+=1; g=gloss(w[2])
          if g: gl[k][era][g]+=1
          ks.add(k)
        verses.append(ks)
  tot={k:sum(c.values()) for k,c in cnt.items()}
  stop=set(sorted(tot,key=lambda k:-tot[k])[:90])
  nv=len(verses); vf=collections.Counter(); pair=collections.Counter()
  for ks in verses:
    vf.update(ks); c=sorted(k for k in ks if k not in stop)
    for i in range(len(c)):
      for j in range(i+1,len(c)): pair[(c[i],c[j])]+=1
  part=collections.defaultdict(list)
  for (a,b),n in pair.items():
    if n<3: continue
    lift=n*nv/(vf[a]*vf[b])
    if lift<4: continue
    s=n*math.log(lift)
    part[a].append((s,b)); part[b].append((s,a))
  out={}
  for k,c in cnt.items():
    e={}
    for era,gc in gl[k].items():
      top=gc.most_common(3); e[era]=[[g,n] for g,n in top]
    o={"b":[[bi,n] for bi,n in sorted(c.items())],"e":e}
    p=[b for s,b in sorted(part.get(k,[]),reverse=True)[:8]]
    if p: o["p"]=p
    out[k]=o
  json.dump(out,open(f"data/lex/u{L}.json","w"),ensure_ascii=False,separators=(",",":"))
  print(L,len(out))
