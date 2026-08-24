import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import assetList from '../../../../public/savemyexams_assets.json';

const GITHUB_RELEASE_V2 = 'https://github.com/fr3ddykru3g3r/ib-vault/releases/download/v2.0';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const rawPath = params.path.map(decodeURIComponent).join('/');
  const cleanPath = rawPath.replace(/^(vault\/)?savemyexams\//, '');

  // 1. Check if local static copy exists in public/vault/savemyexams/
  const localFilePath = path.join(process.cwd(), 'public', 'vault', 'savemyexams', cleanPath);

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

  // 2. Stream from GitHub release v2.0
  const parts = cleanPath.split('/');
  const subjectTag = parts[0] ? parts[0].replace(/[\s\u202f]+/g, '.') : '';
  const filename = parts[parts.length - 1] || '';
  const cleanFn = filename.replace('.pdf', '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

  let matchedAsset: string | null = null;
  if (subjectTag) {
    for (const asset of assetList as string[]) {
      if (asset.includes(subjectTag)) {
        const cleanAsset = asset.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        if (cleanAsset.includes(cleanFn)) {
          matchedAsset = asset;
          break;
        }
      }
    }
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
    // If stream fails, fallback to direct browser redirect
    return NextResponse.redirect(targetUrl, 307);
  }
}
