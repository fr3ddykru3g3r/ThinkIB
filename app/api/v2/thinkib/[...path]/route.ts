import { NextRequest, NextResponse } from 'next/server';

const GITHUB_BASE = 'https://fr3ddykru3g3r.github.io/ThinkIB-Websites';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const subpath = params.path ? params.path.join('/') : '';
  const isHtml = subpath.endsWith('.html') || !subpath.includes('.');

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
      // Return a clean in-portal fallback instead of a raw GitHub 404
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>ThinkIB Portal - Page Notice</title>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 80vh; margin: 0; background: #fcfbfa; color: #1c1c1e; }
            .box { background: #fff; padding: 2.5rem; border-radius: 8px; border: 1px solid rgba(28,28,30,0.1); max-width: 480px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            h2 { color: #b84a39; margin-top: 0; }
            p { color: #767679; font-size: 0.95rem; line-height: 1.5; }
            button { background: #b84a39; color: #fff; border: none; padding: 0.6rem 1.2rem; border-radius: 4px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
          </style>
        </head>
        <body>
          <div class="box">
            <h2>Resource Notice</h2>
            <p>The requested page (<code>${subpath}</code>) is an internal dynamic route or was not included in this offline vault.</p>
            <p>Please use the <strong>Topic Explorer</strong> above to browse available syllabus chapters and worked problem banks.</p>
            <button onclick="window.history.back()">Go Back</button>
          </div>
        </body>
        </html>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }
      );
    }

    let html = await res.text();

    // Calculate directory path for <base href="...">
    const pathParts = subpath.split('/');
    pathParts.pop();
    const dirPath = pathParts.join('/');
    const baseHref = dirPath ? `${GITHUB_BASE}/${dirPath}/` : `${GITHUB_BASE}/`;

    // Script to fix dead top-nav links, broken search forms, and external redirects
    const clientEnhancements = `
      <base href="${baseHref}">
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          // Intercept search forms that trigger static 404
          document.querySelectorAll('form[role="search"]').forEach(function(form) {
            form.addEventListener('submit', function(e) {
              e.preventDefault();
              var input = form.querySelector('input[type="search"]');
              if (input && input.value.trim()) {
                window.parent.postMessage({ type: 'THINKIB_SEARCH', query: input.value.trim() }, '*');
                if (window.find) {
                  window.find(input.value.trim());
                }
              }
            });
          });

          // Fix dead top-nav '#' links in Math AA
          var mathNavMap = {
            'Assessment': 'mathanalysis/page/27728/assessment.html',
            '1. Number & Algebra': 'mathanalysis/page/27768/1-number-algebra.html',
            '2. Functions': 'mathanalysis/page/27778/2-functions.html',
            '3. Geometry & Trigonometry': 'mathanalysis/page/27790/3-geometry-trigonometry.html',
            '4. Statistics & Probability': 'mathanalysis/page/27802/4-statistics-probability.html',
            '5. Calculus': 'mathanalysis/page/27809/5-calculus.html',
            'Toolkit': 'mathanalysis/page/30074/toolkit.html',
            'IB Core': 'mathanalysis/page/27832/ib-core.html'
          };

          document.querySelectorAll('.top-nav a[href="#"]').forEach(function(a) {
            var text = a.textContent.trim();
            if (mathNavMap[text]) {
              a.href = '/api/v2/thinkib/' + mathNavMap[text];
            }
          });

          // Prevent Home from taking user off-site to external login
          document.querySelectorAll('a[href*="student.thinkib.net"]').forEach(function(a) {
            if (a.textContent.indexOf('Home') !== -1) {
              a.href = '/api/v2/thinkib/mathanalysis/index.html';
            }
          });
        });
      </script>
    `;

    // Inject enhancements into <head>
    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>\n${clientEnhancements}`);
    } else {
      html = clientEnhancements + html;
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });
  } catch (error) {
    return NextResponse.redirect(`${GITHUB_BASE}/${subpath}`, 307);
  }
}
