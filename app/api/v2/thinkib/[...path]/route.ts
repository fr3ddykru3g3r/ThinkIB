import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const GITHUB_BASE = 'https://fr3ddykru3g3r.github.io/ThinkIB-Websites';
const LOCAL_DIR = path.join(process.cwd(), '../ThinkIB 2');

let cachedSearchIndex: any[] | null = null;
const cachedSubjectIndexes: Record<string, any[]> = {};
let cachedTopicsIndex: Record<string, { title: string; path: string }[]> | null = null;
let cachedMathTopics: any[] | null = null;

function getTopicsIndex(): Record<string, { title: string; path: string }[]> {
  if (!cachedTopicsIndex) {
    try {
      const p = path.join(process.cwd(), 'app/thinkib/topics_index.json');
      if (fs.existsSync(p)) {
        cachedTopicsIndex = JSON.parse(fs.readFileSync(p, 'utf-8'));
      }
    } catch (e) {
      console.error('Error loading topics_index.json:', e);
    }
  }
  return cachedTopicsIndex || {};
}

function getMathTopics(): any[] {
  if (!cachedMathTopics) {
    try {
      const p = path.join(process.cwd(), 'app/thinkib/math_topics.json');
      if (fs.existsSync(p)) {
        cachedMathTopics = JSON.parse(fs.readFileSync(p, 'utf-8'));
      }
    } catch (e) {
      console.error('Error loading math_topics.json:', e);
    }
  }
  return cachedMathTopics || [];
}

function getSearchIndex(): any[] {
  if (!cachedSearchIndex) {
    try {
      const p = path.join(process.cwd(), 'public/thinkib/search_index.json');
      if (fs.existsSync(p)) {
        cachedSearchIndex = JSON.parse(fs.readFileSync(p, 'utf-8'));
      }
    } catch (e) {
      console.error('Error loading search index:', e);
    }
  }
  return cachedSearchIndex || [];
}

function getSubjectIndex(sub: string): any[] {
  if (sub && sub !== 'all') {
    if (!cachedSubjectIndexes[sub]) {
      try {
        const p = path.join(process.cwd(), `public/thinkib/search_${sub}.json`);
        if (fs.existsSync(p)) {
          cachedSubjectIndexes[sub] = JSON.parse(fs.readFileSync(p, 'utf-8'));
        }
      } catch (e) {
        console.error(`Error loading subject index for ${sub}:`, e);
      }
    }
    if (cachedSubjectIndexes[sub]) return cachedSubjectIndexes[sub];
  }
  return getSearchIndex();
}

let cachedSearchScript: string | null = null;
function getSearchScript(): string {
  if (!cachedSearchScript) {
    try {
      const p = path.join(process.cwd(), 'public/thinkib/tib-search.js');
      if (fs.existsSync(p)) {
        cachedSearchScript = fs.readFileSync(p, 'utf-8');
      }
    } catch (e) {
      console.error('Error loading tib-search.js:', e);
    }
  }
  return cachedSearchScript || '';
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html':
    case '.htm': return 'text/html; charset=utf-8';
    case '.txt': return 'text/plain; charset=utf-8';
    case '.xml': return 'application/xml';
    case '.mp3': return 'audio/mpeg';
    case '.mp4': return 'video/mp4';
    case '.ico': return 'image/x-icon';
    case '.css': return 'text/css';
    case '.js': return 'application/javascript';
    case '.json': return 'application/json';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.gif': return 'image/gif';
    case '.svg': return 'image/svg+xml';
    case '.webp': return 'image/webp';
    case '.pdf': return 'application/pdf';
    case '.woff': return 'font/woff';
    case '.woff2': return 'font/woff2';
    case '.ttf': return 'font/ttf';
    default: return 'application/octet-stream';
  }
}

function rewriteHtmlAssets(html: string, dirPath: string): string {
  // Rewrite absolute ThinkIB / GitHub Pages links
  html = html.replace(/href=["']https?:\/\/(?:[a-z0-9_-]+\.)?thinkib\.net\/([^"']+)["']/gi, 'href="/api/v2/thinkib/$1"');
  html = html.replace(/href=["']https?:\/\/fr3ddykru3g3r\.github\.io\/ThinkIB-Websites\/([^"']+)["']/gi, 'href="/api/v2/thinkib/$1"');
  html = html.replace(/href=["']https?:\/\/fr3ddykru3g3r\.github\.io\/([^"']+)["']/gi, 'href="/api/v2/thinkib/$1"');

  const resolveRel = (url: string) => {
    if (
      !url ||
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('//') ||
      url.startsWith('data:') ||
      url.startsWith('javascript:') ||
      url.startsWith('mailto:') ||
      url.startsWith('#') ||
      url.startsWith('/api/v2/thinkib/')
    ) {
      return url;
    }
    if (url.startsWith('/')) {
      return `/api/v2/thinkib${url}`;
    }
    const cleanDir = dirPath ? dirPath.replace(/\/+$/, '') + '/' : '';
    return `/api/v2/thinkib/${cleanDir}${url}`;
  };

  // Rewrite relative <img src="...">
  html = html.replace(/(<img\b[^>]*?\bsrc=["'])([^"']+)(["'][^>]*>)/gi, (_, prefix, src, suffix) => {
    return `${prefix}${resolveRel(src)}${suffix}`;
  });

  // Rewrite relative <link href="...">
  html = html.replace(/(<link\b[^>]*?\bhref=["'])([^"']+)(["'][^>]*>)/gi, (_, prefix, href, suffix) => {
    return `${prefix}${resolveRel(href)}${suffix}`;
  });

  // Rewrite relative <script src="...">
  html = html.replace(/(<script\b[^>]*?\bsrc=["'])([^"']+)(["'][^>]*>)/gi, (_, prefix, src, suffix) => {
    return `${prefix}${resolveRel(src)}${suffix}`;
  });

  return html;
}

function renderFallbackTopicsPage(subpath: string, query = ''): string {
  const allTopics = getTopicsIndex();
  const mathTopics = getMathTopics();

  let subjectKey = 'mathanalysis';
  const pLower = subpath.toLowerCase();
  for (const k of Object.keys(allTopics)) {
    if (pLower.includes(k)) {
      subjectKey = k;
      break;
    }
  }

  let topicList: { title: string; path: string }[] = allTopics[subjectKey] || [];
  if (subjectKey === 'mathanalysis' && mathTopics.length > 0 && (!topicList || topicList.length === 0)) {
    topicList = mathTopics.map((m) => ({ title: m.title, path: m.path }));
  }

  const subjectNames: Record<string, string> = {
    mathanalysis: 'Math: Analysis & Approaches',
    chem: 'Chemistry',
    biology: 'Biology',
    physics: 'Physics',
    economics: 'Economics',
    psychology: 'Psychology',
    history: 'History',
    englisha: 'English A: Literature',
  };

  const currentSubjectName = subjectNames[subjectKey] || subjectKey.toUpperCase();

  const cardsHtml = topicList.slice(0, 40).map((t) => `
    <div style="padding: 14px 18px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff; transition: transform 0.15s ease, box-shadow 0.15s ease; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <a href="/api/v2/thinkib/${t.path}" style="font-size: 15px; font-weight: 600; color: #0284c7; text-decoration: none; display: block; line-height: 1.4;">
        <i class="fa fa-book" style="margin-right: 8px; color: #3b82f6;"></i>
        ${escapeHtml(t.title)}
      </a>
      <div style="font-size: 11px; color: #94a3b8; font-family: monospace; margin-top: 6px;">${escapeHtml(t.path)}</div>
    </div>
  `).join('');

  const subjectPills = Object.keys(allTopics).map((k) => `
    <a href="/api/v2/thinkib/${k}/index.html" style="padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; text-decoration: none; border: 1px solid ${k === subjectKey ? '#0284c7' : '#cbd5e1'}; background: ${k === subjectKey ? '#e0f2fe' : '#ffffff'}; color: ${k === subjectKey ? '#0369a1' : '#475569'};">
      ${escapeHtml(subjectNames[k] || k)}
    </a>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(currentSubjectName)} - ThinkIB Directory</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
  <style>
    body { background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 24px; }
    .container { max-width: 1040px; margin: 0 auto; }
    .banner { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; color: #92400e; font-size: 14px; }
    .header-box { background: #ffffff; padding: 24px; border-radius: 10px; border: 1px solid #e2e8f0; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="banner">
      <i class="fa fa-info-circle fa-lg" style="color: #d97706;"></i>
      <div>
        <strong>ThinkIB Offline Mirror Directory:</strong> The requested route (<code>${escapeHtml(subpath)}</code>) was not found directly in the static server bundle. Below is the indexed syllabus directory for <strong>${escapeHtml(currentSubjectName)}</strong>.
      </div>
    </div>

    <div class="header-box">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
        <h1 style="margin: 0; font-size: 22px; color: #0f172a;">
          <i class="fa fa-graduation-cap" style="color: #0284c7; margin-right: 8px;"></i>
          ${escapeHtml(currentSubjectName)} Syllabus Topics
        </h1>
        <button onclick="window.history.back()" style="background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-weight: 600; color: #334155;">
          <i class="fa fa-arrow-left"></i> Back
        </button>
      </div>

      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
        ${subjectPills}
      </div>
    </div>

    <div class="grid">
      ${cardsHtml}
    </div>
  </div>
</body>
</html>`;
}

function renderServerSearchPage(query: string, subpath: string): string {
  const lowerQ = query.toLowerCase().trim();
  const terms = lowerQ.split(/\s+/).filter(t => t.length > 0);

  let currentSub = 'all';
  const pLower = subpath.toLowerCase();
  if (pLower.includes('mathanalysis')) currentSub = 'mathanalysis';
  else if (pLower.includes('englisha')) currentSub = 'englisha';
  else if (pLower.includes('chem')) currentSub = 'chem';
  else if (pLower.includes('history')) currentSub = 'history';
  else if (pLower.includes('psychology')) currentSub = 'psychology';
  else if (pLower.includes('biology')) currentSub = 'biology';
  else if (pLower.includes('economics')) currentSub = 'economics';
  else if (pLower.includes('business')) currentSub = 'business';

  const index = getSubjectIndex(currentSub);

  const scored: { item: any; score: number }[] = [];
  if (terms.length > 0) {
    for (let i = 0; i < index.length; i++) {
      const item = index[i];
      if (item.sub === 'englishb') continue;
      const tLow = (item.t || '').toLowerCase();
      const cLow = (item.c || '').toLowerCase();
      const sLow = (item.s || '').toLowerCase();
      const kLow = (item.k || '').toLowerCase();

      let score = 0;
      let allMatch = true;
      for (const term of terms) {
        let match = false;
        if (tLow.includes(term)) { score += 25; match = true; }
        if (cLow.includes(term)) { score += 12; match = true; }
        if (sLow.includes(term)) { score += 6; match = true; }
        if (kLow.includes(term)) { score += 4; match = true; }
        if (!match) {
          allMatch = false;
          break;
        }
      }
      if (allMatch) {
        if (item.sub === currentSub) score += 10;
        scored.push({ item, score });
      }
    }
    scored.sort((a, b) => b.score - a.score);
  }

  const matches = scored.map(s => s.item);

  let resultsHtml = '';
  if (!matches.length) {
    resultsHtml = `
      <div style="padding: 3rem 1.5rem; text-align: center; background: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1; margin-top: 1.5rem;">
        <i class="fa fa-search fa-3x" style="color: #94a3b8; margin-bottom: 1rem;"></i>
        <h3 style="color: #334155; margin-bottom: 0.5rem;">No resources found for "${escapeHtml(query)}"</h3>
        <p style="color: #64748b; max-width: 480px; margin: 0 auto 1.5rem; font-size: 14px; line-height: 1.5;">
          Try searching for broader terms (e.g. "calculus", "bonding", "paper 1", "functions", "equilibrium") or browse syllabus topics via the navigation bar.
        </p>
        <button onclick="window.history.back()" class="btn btn-primary btn-sm" style="font-weight: 600;">
          <i class="fa fa-arrow-left" style="margin-right: 6px;"></i> Return to previous page
        </button>
      </div>
    `;
  } else {
    resultsHtml = '<div style="display: flex; flex-direction: column; gap: 14px; margin-top: 18px;">';
    for (const it of matches) {
      const href = `/api/v2/thinkib/${it.p}`;
      const tag = it.c || it.sub;
      resultsHtml += `
        <div class="tib-result-card" style="padding: 16px 20px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 6px;">
            <a href="${href}" style="font-size: 16px; font-weight: 700; color: #0284c7; text-decoration: none; line-height: 1.4;">
              <i class="fa fa-file-text-o" style="margin-right: 8px; color: #3b82f6;"></i>
              ${escapeHtml(it.t)}
            </a>
            ${tag ? `<span style="font-size: 11px; font-weight: 600; background: #f1f5f9; color: #334155; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; white-space: nowrap;">${escapeHtml(tag)}</span>` : ''}
          </div>
          ${it.s ? `<p style="margin: 6px 0 10px; color: #475569; font-size: 13.5px; line-height: 1.55;">${escapeHtml(it.s)}</p>` : ''}
          <div style="font-size: 11px; color: #94a3b8; font-family: monospace;">${escapeHtml(it.p)}</div>
        </div>
      `;
    }
    resultsHtml += '</div>';
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Search Results: ${escapeHtml(query)} - ThinkIB</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" type="text/css" href="${GITHUB_BASE}/css/style.min.css">
  <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
  <style>
    body { background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 20px; }
    .layout-container { max-width: 1100px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
    .header-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; }
    .btn-back { background: #0284c7; color: #fff; padding: 8px 18px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; border: none; cursor: pointer; }
    .btn-back:hover { background: #0369a1; }
  </style>
</head>
<body>
  <div class="layout-container">
    <div class="header-bar">
      <div>
        <h1 style="margin: 0; font-size: 24px; color: #0f172a;">
          <i class="fa fa-search" style="color: #0284c7; margin-right: 10px;"></i>
          Search Results: <span style="color: #0284c7;">"${escapeHtml(query)}"</span>
        </h1>
        <p style="margin: 6px 0 0; color: #64748b; font-size: 14px;">Found <strong>${matches.length}</strong> matching resources</p>
      </div>
      <button onclick="window.history.back()" class="btn-back">
        <i class="fa fa-arrow-left"></i> Back to Previous Page
      </button>
    </div>
    ${resultsHtml}
  </div>
</body>
</html>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const rawSubpath = (await params).path
    ? (await params).path
        .map((seg) => {
          try {
            return decodeURIComponent(seg);
          } catch {
            return seg;
          }
        })
        .join('/')
    : '';

  // Prevent directory traversal
  const subpath = path.normalize(rawSubpath).replace(/^(\.\.[\/\\])+/, '');
  const isHtml = subpath.endsWith('.html') || subpath.endsWith('.htm') || !subpath.includes('.');
  const searchParam = request.nextUrl.searchParams.get('s');

  // Intercept search queries or paths containing /search
  if (subpath.endsWith('/search') || subpath === 'search' || subpath.includes('/search') || (searchParam && subpath.includes('search'))) {
    const query = searchParam || '';
    const searchPage = renderServerSearchPage(query, subpath);
    return new NextResponse(searchPage, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        'CDN-Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      }
    });
  }

  // Check if file exists locally in ../ThinkIB 2 (for development / local-first setups)
  const localFilePath = path.resolve(LOCAL_DIR, subpath);
  if (localFilePath.startsWith(LOCAL_DIR + path.sep) && fs.existsSync(localFilePath) && fs.statSync(localFilePath).isFile()) {
    if (isHtml) {
      let localHtml = fs.readFileSync(localFilePath, 'utf-8');
      const pathParts = subpath.split('/');
      pathParts.pop();
      const dirPath = pathParts.join('/');
      const baseHref = `/api/v2/thinkib/${dirPath ? dirPath + '/' : ''}`;

      localHtml = rewriteHtmlAssets(localHtml, dirPath);
      const searchScriptCode = getSearchScript();
      const injection = `
        <base href="${baseHref}">
        <script>
          ${searchScriptCode}
        </script>
      `;
      if (localHtml.includes('<head>')) {
        localHtml = localHtml.replace('<head>', `<head>\n${injection}`);
      } else {
        localHtml = injection + localHtml;
      }

      return new NextResponse(localHtml, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=86400, s-maxage=604800',
        }
      });
    } else {
      const buffer = fs.readFileSync(localFilePath);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': getMimeType(localFilePath),
          'Cache-Control': 'public, max-age=604800',
        }
      });
    }
  }

  // For non-HTML assets (images, css, pdf, js), redirect directly to GitHub Pages CDN
  if (!isHtml) {
    return NextResponse.redirect(`${GITHUB_BASE}/${subpath}`, 307);
  }

  // Fetch HTML directly from GitHub Pages
  try {
    const targetUrl = `${GITHUB_BASE}/${subpath}`;
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      if (searchParam) {
        const searchPage = renderServerSearchPage(searchParam, subpath);
        return new NextResponse(searchPage, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      }

      // Serve fallback syllabus directory from pre-indexed JSON
      const fallbackHtml = renderFallbackTopicsPage(subpath);
      return new NextResponse(fallbackHtml, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    let html = await res.text();

    // Calculate directory path for asset resolution
    const pathParts = subpath.split('/');
    pathParts.pop();
    const dirPath = pathParts.join('/');
    const baseHref = `/api/v2/thinkib/${dirPath ? dirPath + '/' : ''}`;

    // Rewrite relative assets (<img src>, <link href>, <script src>) and absolute links
    html = rewriteHtmlAssets(html, dirPath);

    // Load full client search script
    const searchScriptCode = getSearchScript();

    // Inject base href and search engine
    const injection = `
      <base href="${baseHref}">
      <script>
        ${searchScriptCode}
      </script>
    `;

    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>\n${injection}`);
    } else {
      html = injection + html;
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000',
        'CDN-Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=2592000',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=2592000',
      }
    });
  } catch (error) {
    // If fetching fails completely, fallback to pre-indexed topics
    const fallbackHtml = renderFallbackTopicsPage(subpath);
    return new NextResponse(fallbackHtml, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}

