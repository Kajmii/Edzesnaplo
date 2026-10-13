"""Render .dc.html mockups to PNG and report overflow.

Usage: python3 render.py <project_dir> <out_dir> [file ...]
Renders each file at 360/390/430 px (frame width substituted), PNG at 2x for 390,
and prints elements that stick out of the frame or clip their own text.
"""
import json, re, sys, pathlib
from playwright.sync_api import sync_playwright

FONT_CSS = """
@font-face{font-family:'IBM Plex Sans';src:local('Inter Regular'),local('Inter-Regular');font-weight:400}
@font-face{font-family:'IBM Plex Sans';src:local('Inter Medium'),local('Inter-Medium');font-weight:500}
@font-face{font-family:'IBM Plex Sans';src:local('Inter SemiBold'),local('Inter-SemiBold');font-weight:600}
@font-face{font-family:'IBM Plex Sans';src:local('Inter Bold'),local('Inter-Bold');font-weight:700}
@font-face{font-family:'IBM Plex Mono';src:local('Liberation Mono'),local('LiberationMono');font-weight:100 900}
@font-face{font-family:'Anton';src:local('TeXGyreHerosCondensed-Bold');font-weight:100 900}
@font-face{font-family:'Archivo';src:local('Liberation Sans'),local('LiberationSans');font-weight:400}
@font-face{font-family:'Archivo';src:local('Liberation Sans Bold'),local('LiberationSans-Bold');font-weight:500 900}
@font-face{font-family:'Atkinson Hyperlegible';src:local('DejaVu Sans'),local('DejaVuSans');font-weight:400}
@font-face{font-family:'Atkinson Hyperlegible';src:local('DejaVu Sans Bold'),local('DejaVuSans-Bold');font-weight:700}
"""

CHECK_JS = r"""
() => {
  const root = document.querySelector('#frame');
  const R = root.getBoundingClientRect();
  const out = [];
  const flagged = new Set();
  const all = root.querySelectorAll('*');
  for (const el of all) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    // skip intentionally off-screen (sr-only)
    if (r.right < R.left - 100) continue;
    let p = el.parentElement, parentFlagged = false;
    while (p && p !== root) { if (flagged.has(p)) { parentFlagged = true; break; } p = p.parentElement; }
    const label = (el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + ' "' + (el.textContent || '').trim().replace(/\s+/g,' ').slice(0, 40) + '"');
    const issues = [];
    if (r.right > R.right + 0.5) issues.push('kilóg jobbra ' + Math.round(r.right - R.right) + 'px');
    if (r.left < R.left - 0.5) issues.push('kilóg balra ' + Math.round(R.left - r.left) + 'px');
    if (r.bottom > R.bottom + 0.5 && r.top < R.bottom) issues.push('levágva alul ' + Math.round(r.bottom - R.bottom) + 'px');
    if (r.top >= R.bottom) issues.push('teljesen a képernyő alatt');
    // own text clipped horizontally
    if (el.children.length === 0 && el.scrollWidth > el.clientWidth + 1 && cs.overflow !== 'visible') issues.push('saját szöveg levágva');
    if (el.tagName !== 'svg' && el.closest('svg') == null && el.children.length === 0 && el.scrollWidth > el.clientWidth + 1 && (el.textContent||'').trim()) issues.push('szöveg szélesebb a dobozánál (' + el.scrollWidth + '>' + el.clientWidth + ')');
    if (issues.length && !parentFlagged) { flagged.add(el); out.push(label + ': ' + issues.join(', ')); }
  }
  // words split across lines
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const text = n.textContent;
    const re = /\S+/g; let m;
    while ((m = re.exec(text))) {
      if (m[0].length < 2) continue;
      const range = document.createRange();
      range.setStart(n, m.index); range.setEnd(n, m.index + m[0].length);
      const rects = Array.from(range.getClientRects()).filter(r => r.width > 0);
      const tops = new Set(rects.map(r => Math.round(r.top)));
      if (tops.size > 1) out.push('szó két sorra tört: "' + m[0] + '"');
    }
  }
  // content height vs frame for scroll containers
  const main = root.querySelector('main');
  let mainOverflow = null;
  if (main && main.scrollHeight > main.clientHeight + 1) mainOverflow = main.scrollHeight - main.clientHeight;
  return {issues: out, mainOverflow};
}
"""


def build(src: str, width: int) -> str:
    props = re.search(r"data-props='(.*?)'", src, re.S)
    defaults = {}
    if props:
        for k, v in json.loads(props.group(1)).items():
            if isinstance(v, dict) and 'default' in v:
                defaults[k] = v['default']
    helmet = re.search(r"<helmet>(.*?)</helmet>", src, re.S).group(1)
    helmet = re.sub(r"<link[^>]*fonts.googleapis[^>]*>", "", helmet)
    body = re.search(r"<x-dc>(.*?)</x-dc>", src, re.S).group(1)
    body = re.sub(r"<helmet>.*?</helmet>", "", body, flags=re.S)
    for k, v in defaults.items():
        body = body.replace('{{' + k + '}}', v)
        helmet = helmet.replace('{{' + k + '}}', v)
    body = body.replace('<div style="width: 390px;', '<div id="frame" style="width: %dpx;' % width, 1)
    return ('<!doctype html><html lang="hu"><head><meta charset="utf-8"><style>' + FONT_CSS +
            '</style>' + helmet + '</head><body style="margin:0">' + body + '</body></html>')


def main():
    proj = pathlib.Path(sys.argv[1]); out = pathlib.Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
    files = sys.argv[3:] or sorted(p.name for p in proj.glob('*.dc.html'))
    with sync_playwright() as p:
        b = p.chromium.launch()
        for name in files:
            src = (proj / name).read_text()
            for w in (360, 390, 430):
                ctx = b.new_context(viewport={'width': w, 'height': 844}, device_scale_factor=2 if w == 390 else 1, reduced_motion='reduce')
                page = ctx.new_page()
                page.set_content(build(src, w), wait_until='load')
                page.wait_for_timeout(150)
                if page.query_selector('#frame') is None:
                    print(f'{name} @{w}: NINCS #frame'); ctx.close(); continue
                res = page.evaluate(CHECK_JS)
                stem = name.replace('.dc.html', '')
                if w == 390:
                    page.query_selector('#frame').screenshot(path=str(out / f'{stem}.png'))
                elif res['issues']:
                    page.query_selector('#frame').screenshot(path=str(out / f'{stem}@{w}.png'))
                flag = 'OK' if not res['issues'] and not res['mainOverflow'] else 'HIBA'
                print(f'{name} @{w}: {flag}' + (f"  main túlcsordul {res['mainOverflow']}px" if res['mainOverflow'] else ''))
                for i in res['issues'][:12]:
                    print('   - ' + i)
                ctx.close()
        b.close()


if __name__ == '__main__':
    main()
