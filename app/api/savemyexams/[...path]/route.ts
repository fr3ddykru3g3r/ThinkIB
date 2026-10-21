import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import assetList from '../../../../public/savemyexams_assets.json';

const GITHUB_RELEASE_V2 = 'https://github.com/fr3ddykru3g3r/ib-vault/releases/download/v2.0';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const rawPath = (params.path || []).map((seg) => {
    try {
      return decodeURIComponent(seg);
    } catch {
      return seg;
    }
  }).join('/');
  const cleanPath = rawPath.replace(/^(vault\/)?savemyexams\//, '');

  // 1. Check if local static copy exists in public/vault/savemyexams/
  const baseDir = path.join(process.cwd(), 'public', 'vault', 'savemyexams');
  const localFilePath = path.resolve(baseDir, cleanPath);
  if (!localFilePath.startsWith(baseDir + path.sep)) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
  }

  if (fs.existsSync(localFilePath) && fs.statSync(localFilePath).isFile()) {
    const encodedRedirect = cleanPath.split('/').map(encodeURIComponent).join('/');
    return NextResponse.redirect(`${request.nextUrl.origin}/vault/savemyexams/${encodedRedirect}`, 307);
  }

  // 2. Stream from GitHub release v2.0
  const parts = cleanPath.split('/');
  const subjectTag = parts[0] ? parts[0].replace(/[\s\u202f]+/g, '.') : '';
  const filename = parts[parts.length - 1] || '';
  const cleanFn = filename.replace('.pdf', '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  // Prefer an asset whose own filename part matches exactly (assets are named
  // "<folders>__<file>.pdf"); fall back to the first substring match.
  let matchedAsset: string | null = null;
  if (subjectTag && cleanFn && filename.toLowerCase().endsWith('.pdf')) {
    const candidates = (assetList as string[]).filter((a) => a.includes(subjectTag));
    const norm = (s: string) => s.replace('.pdf', '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    matchedAsset =
      candidates.find((a) => norm(a.split('__').pop() || '') === cleanFn) ??
      candidates.find((a) => norm(a).includes(cleanFn)) ??
      null;
  }

  if (!matchedAsset) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
  }

  const targetUrl = `${GITHUB_RELEASE_V2}/${encodeURIComponent(matchedAsset)}`;

  try {
    const fileRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!fileRes.ok) {
      // Fallback direct redirect if proxy responds non-200
      return NextResponse.redirect(targetUrl, 307);
    }

    return new NextResponse(fileRes.body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
        'CDN-Cache-Control': 'public, s-maxage=31536000, immutable',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=31536000, immutable',
      }
    });
  } catch (err: any) {
    // If stream fails, fallback to direct browser redirect
    return NextResponse.redirect(targetUrl, 307);
  }
}
