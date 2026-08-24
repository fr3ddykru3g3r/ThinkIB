import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import v1Assets from '../../../../public/past_papers_assets.json';
import v2Assets from '../../../../public/savemyexams_assets.json';

const GITHUB_RELEASE_V1 = 'https://github.com/fr3ddykru3g3r/ib-vault/releases/download/v1.0';
const GITHUB_RELEASE_V2 = 'https://github.com/fr3ddykru3g3r/ib-vault/releases/download/v2.0';

const v1Set = new Set(v1Assets as string[]);
const v2Set = new Set(v2Assets as string[]);

function resolvePastPaperAsset(pathList: string[]): { assetName: string; release: 'v1' | 'v2' | 'static' } | null {
  if (pathList[0] === 'local-vault') {
    const filename = pathList[pathList.length - 1];
    return { assetName: `/local-vault/${filename}`, release: 'static' };
  }

  const filename = pathList[pathList.length - 1] || '';
  
  // 1. Direct standard transform (spaces to dots)
  const rawPath = pathList.join('__');
  const c1 = rawPath.replace(/[\s\u202f]+/g, '.');
  if (v1Set.has(c1)) return { assetName: c1, release: 'v1' };
  if (v2Set.has(c1)) return { assetName: c1, release: 'v2' };

  // 2. Collapse consecutive dots
  const c2 = c1.replace(/\.+/g, '.');
  if (v1Set.has(c2)) return { assetName: c2, release: 'v1' };
  if (v2Set.has(c2)) return { assetName: c2, release: 'v2' };

  // 3. Smart feature-based matching (Paper, TZ, Level, Subject)
  const fnLower = filename.toLowerCase();
  const tzMatch = fnLower.match(/tz\d+/);
  const tz = tzMatch ? tzMatch[0] : null;

  const paperMatch = fnLower.match(/paper[_\s]*\d+[a-z]?/);
  const paper = paperMatch ? paperMatch[0].replace(' ', '_') : null;

  const isHl = fnLower.includes('hl');
  const isSl = fnLower.includes('sl') && !isHl;
  const isMs = fnLower.includes('markscheme') || fnLower.includes('_ms');

  const subjTokens = pathList.map(p => p.toLowerCase()).filter(p =>
    ['chem', 'bio', 'phys', 'math', 'econ', 'psych', 'english', 'history', 'geog', 'bus', 'comp'].some(s => p.includes(s))
  );

  const sources: Array<['v1' | 'v2', string[]]> = [
    ['v1', v1Assets as string[]],
    ['v2', v2Assets as string[]]
  ];

  for (const [releaseName, assetList] of sources) {
    for (const asset of assetList as string[]) {
      const al = asset.toLowerCase();

      // Match Year if present in path
      const yearMatch = rawPath.match(/20\d\d/);
      if (yearMatch && !al.includes(yearMatch[0])) {
        continue;
      }

      if (tz && !al.includes(tz)) continue;
      if (paper && !al.includes(paper)) continue;
      if (isMs !== (al.includes('markscheme') || al.includes('_ms'))) continue;
      if (isHl && !al.includes('hl')) continue;
      if (isSl && !al.includes('_sl') && !al.includes('.sl')) continue;

      if (subjTokens.length > 0) {
        if (subjTokens.some(st => al.includes(st))) {
          return { assetName: asset, release: releaseName };
        }
      } else {
        return { assetName: asset, release: releaseName };
      }
    }
  }

  // 4. Fallback: fuzzy match using alphanumeric filename stem
  const cleanFn = filename.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  if (cleanFn.length > 3) {
    for (const asset of v1Assets as string[]) {
      const cleanAsset = asset.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (cleanAsset.includes(cleanFn)) {
        return { assetName: asset, release: 'v1' };
      }
    }

    for (const asset of v2Assets as string[]) {
      const cleanAsset = asset.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (cleanAsset.includes(cleanFn)) {
        return { assetName: asset, release: 'v2' };
      }
    }
  }

  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const pathSegments = params.path.map(decodeURIComponent);
  const filename = pathSegments[pathSegments.length - 1];

  // 1. Check direct local copy in 2025-past-papers vault
  const local2025Path = path.join(process.cwd(), 'public', 'vault', '2025-past-papers');
  if (fs.existsSync(local2025Path)) {
    for (const folder of fs.readdirSync(local2025Path)) {
      const candidate = path.join(local2025Path, folder, filename);
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        const fileBuffer = fs.readFileSync(candidate);
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': filename.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
            'Content-Disposition': 'inline',
            'Cache-Control': 'public, max-age=31536000, immutable'
          }
        });
      }
    }
  }

  // 2. Check local static copy in public/vault/past-papers/
  const relativePath = pathSegments.join('/');
  const localFilePath = path.join(process.cwd(), 'public', 'vault', 'past-papers', relativePath);

  if (fs.existsSync(localFilePath) && fs.statSync(localFilePath).isFile()) {
    const fileBuffer = fs.readFileSync(localFilePath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  }

  // 3. Fallback to GitHub release asset lookup
  const resolved = resolvePastPaperAsset(pathSegments);

  if (!resolved) {
    return NextResponse.json({ error: 'Past paper asset not found in index' }, { status: 404 });
  }

  if (resolved.release === 'static') {
    const origin = request.nextUrl.origin;
    return NextResponse.redirect(`${origin}${resolved.assetName}`, 307);
  }

  const baseUrl = resolved.release === 'v1' ? GITHUB_RELEASE_V1 : GITHUB_RELEASE_V2;
  const targetUrl = `${baseUrl}/${encodeURIComponent(resolved.assetName)}`;

  try {
    const fileRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!fileRes.ok) {
      return NextResponse.redirect(targetUrl, 307);
    }
    const arrayBuffer = await fileRes.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (err: any) {
    return NextResponse.redirect(targetUrl, 307);
  }
}
