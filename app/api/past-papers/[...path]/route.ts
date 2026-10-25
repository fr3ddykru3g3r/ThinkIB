import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import importedPaperMap from '@/lib/imported-paper-map.json';
import path from 'path';
import v1Assets from '../../../../public/past_papers_assets.json';
import v2Assets from '../../../../public/savemyexams_assets.json';

const GITHUB_RELEASE_V1 = 'https://github.com/fr3ddykru3g3r/ib-vault/releases/download/v1.0';
const GITHUB_RELEASE_V2 = 'https://github.com/fr3ddykru3g3r/ib-vault/releases/download/v2.0';
const GITHUB_RELEASE_V3_TOPICALS = process.env.NEXT_PUBLIC_TOPICALS_CDN_BASE || 'https://github.com/fr3ddykru3g3r/ib-vault/releases/download/v3.0-topicals';

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
      }
    }
  }

  // 4. Fallback: fuzzy match using alphanumeric filename stem
  const cleanFn = filename.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const requestedYear = rawPath.match(/20\d\d/)?.[0];
  const requestedSession = rawPath.toLowerCase().match(/may|november|nov/)?.[0];
  const sameSession = (asset: string) => (!requestedYear || asset.includes(requestedYear)) && (!requestedSession || asset.toLowerCase().includes(requestedSession));
  if (cleanFn.length > 3) {
    for (const asset of v1Assets as string[]) {
      const cleanAsset = asset.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (sameSession(asset) && cleanAsset.includes(cleanFn)) {
        return { assetName: asset, release: 'v1' };
      }
    }

    for (const asset of v2Assets as string[]) {
      const cleanAsset = asset.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (sameSession(asset) && cleanAsset.includes(cleanFn)) {
        return { assetName: asset, release: 'v2' };
      }
    }
  }

  return null;
}

import map2025 from '../../../../public/2025_past_papers_map.json';

const map2025Record = map2025 as Record<string, string>;

/**
 * Normalizes paper keys by lowercasing, replacing [_\-+%20\s]+ with single space,
 * and stripping redundant session prefixes.
 */
function normalizePaperKey(str: string): string {
  return (str || '')
    .toLowerCase()
    .replace(/\.pdf$/i, '')
    .replace(/(?:may|nov|november|may-june|specimen|m25|n25|2025)[_\s\-]*/gi, '')
    .replace(/[_\-+%20\s]+/g, ' ')
    .trim();
}

const normalizedMap2025 = new Map<string, string>();
for (const [key, val] of Object.entries(map2025Record)) {
  normalizedMap2025.set(normalizePaperKey(key), val);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const pathSegments = ((await params).path || []).map((seg) => {
    try {
      return decodeURIComponent(seg);
    } catch {
      return seg;
    }
  });
  // Each segment must be a plain name: no traversal, no embedded separators
  if (pathSegments.some((seg) => seg === '..' || seg === '.' || /[\\/\0]/.test(seg))) {
    return new NextResponse('Not found', { status: 404 });
  }
  const imported=(importedPaperMap as Record<string,string>)[pathSegments.join('/')];
  if(imported)return NextResponse.redirect(imported,307);
  const filename = pathSegments[pathSegments.length - 1];

  // 0. Check if request is for a Topical Past Paper (Physics, Chemistry, Math)
  let topicalSubject: 'physics' | 'chemistry' | 'math' | null = null;
  let topicalFilename: string | null = null;

  if (pathSegments[0] === 'topicals' && pathSegments.length >= 3) {
    const s = pathSegments[1].replace('-topicals', '').toLowerCase();
    if (s === 'physics' || s === 'chemistry' || s === 'math') {
      topicalSubject = s;
      topicalFilename = pathSegments.slice(2).join('/');
    }
  } else if (
    pathSegments[0] &&
    pathSegments[0].endsWith('-topicals')
  ) {
    const s = pathSegments[0].replace('-topicals', '').toLowerCase();
    if (s === 'physics' || s === 'chemistry' || s === 'math') {
      topicalSubject = s;
      topicalFilename = pathSegments.slice(1).join('/');
    }
  }

  if (topicalSubject && topicalFilename) {
    const isDownload = request.nextUrl.searchParams.get('download') === '1';
    const safeFilename = path.basename(topicalFilename);

    // Tier 1: Local Development disk check
    const topicalDir = path.join(process.cwd(), 'public', 'vault', `${topicalSubject}-topicals`);
    const localTopicalPath = path.resolve(topicalDir, topicalFilename);
    if (!localTopicalPath.startsWith(topicalDir + path.sep)) {
      return new NextResponse('Not found', { status: 404 });
    }
    if (fs.existsSync(localTopicalPath) && fs.statSync(localTopicalPath).isFile()) {
      if (isDownload) {
        return new NextResponse(fs.readFileSync(localTopicalPath), {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${safeFilename}"`,
          },
        });
      }
      return new NextResponse(fs.readFileSync(localTopicalPath), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${safeFilename}"`,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // Tier 2: Vercel Production GitHub Release CDN Streaming
    const cdnAssetName = `${topicalSubject}__${topicalFilename}`;
    const cdnUrl = `${GITHUB_RELEASE_V3_TOPICALS}/${encodeURIComponent(cdnAssetName)}`;

    if (isDownload) {
      return NextResponse.redirect(cdnUrl, 307);
    }

    try {
      const upstreamRes = await fetch(cdnUrl, {
        headers: {
          ...(request.headers.get('range') ? { Range: request.headers.get('range')! } : {}),
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (upstreamRes.ok && upstreamRes.body) {
        return new NextResponse(upstreamRes.body, {
          status: upstreamRes.status,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${safeFilename}"`,
            ...Object.fromEntries(['content-length', 'content-range', 'accept-ranges'].flatMap(key => upstreamRes.headers.has(key) ? [[key, upstreamRes.headers.get(key)!]] : [])),
            'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
            'CDN-Cache-Control': 'public, s-maxage=31536000, immutable',
            'Vercel-CDN-Cache-Control': 'public, s-maxage=31536000, immutable',
          },
        });
      }
      return NextResponse.redirect(cdnUrl, 307);
    } catch (err: any) {
      return NextResponse.redirect(cdnUrl, 307);
    }
  }
  // The 2025 map only applies to 2025 papers (older sessions reuse the same filenames)
  const is2025 = pathSegments.length === 1 || pathSegments[0].startsWith('2025');
  if (filename && is2025) {
    if (Object.prototype.hasOwnProperty.call(map2025Record, filename)) {
      return NextResponse.redirect(`${request.nextUrl.origin}${map2025Record[filename]}`, 307);
    }
    const normKey = normalizePaperKey(filename);
    if (normalizedMap2025.has(normKey)) {
      return NextResponse.redirect(`${request.nextUrl.origin}${normalizedMap2025.get(normKey)}`, 307);
    }
  }

  // Also check if joined path matches a normalized 2025 paper
  const fullNormKey = normalizePaperKey(pathSegments.join(' '));
  if (is2025 && fullNormKey.length > 5) {
    for (const [normKey, targetUrl] of Array.from(normalizedMap2025.entries())) {
      if (normKey.length > 5 && (fullNormKey.includes(normKey) || normKey.includes(fullNormKey))) {
        return NextResponse.redirect(`${request.nextUrl.origin}${targetUrl}`, 307);
      }
    }
  }

  // 2. Check local static copy in public/vault/past-papers/
  const relativePath = pathSegments.join('/');
  const pastPapersDir = path.join(process.cwd(), 'public', 'vault', 'past-papers');
  const localFilePath = path.resolve(pastPapersDir, relativePath);

  if (localFilePath.startsWith(pastPapersDir + path.sep) && fs.existsSync(localFilePath) && fs.statSync(localFilePath).isFile()) {
    const encodedRedirect = pathSegments.map(encodeURIComponent).join('/');
    return NextResponse.redirect(`${request.nextUrl.origin}/vault/past-papers/${encodedRedirect}`, 307);
  }

  // 3. Fallback to GitHub release asset lookup
  const resolved = resolvePastPaperAsset(pathSegments);

  if (!resolved) {
    return NextResponse.json({ error: 'This paper is not available in the archive. Try another session or paper.' }, { status: 404 });
  }

  if (resolved.release === 'static') {
    const origin = request.nextUrl.origin;
    return NextResponse.redirect(`${origin}${resolved.assetName}`, 307);
  }

  const baseUrl = resolved.release === 'v1' ? GITHUB_RELEASE_V1 : GITHUB_RELEASE_V2;
  const targetUrl = `${baseUrl}/${encodeURIComponent(resolved.assetName)}`;

  if (request.nextUrl.searchParams.get('download') === '1') {
    return NextResponse.redirect(targetUrl, 307);
  }

  try {
    const fileRes = await fetch(targetUrl, {
      signal: AbortSignal.timeout(20000),
      headers: {
        ...(request.headers.get('range') ? { Range: request.headers.get('range')! } : {}),
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!fileRes.ok) {
      return NextResponse.redirect(targetUrl, 307);
    }
    return new NextResponse(fileRes.body, {
      status: fileRes.status,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${path.basename(resolved.assetName)}"`,
            ...Object.fromEntries(['content-length', 'content-range', 'accept-ranges'].flatMap(key => fileRes.headers.has(key) ? [[key, fileRes.headers.get(key)!]] : [])),
        'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
        'CDN-Cache-Control': 'public, s-maxage=31536000, immutable',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=31536000, immutable',
      }
    });
  } catch (err: any) {
    return NextResponse.redirect(targetUrl, 307);
  }
}
