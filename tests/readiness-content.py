"""Public GET evidence only. Never reads customer quotations or creates records."""
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import HTTPError
import json, time

out = Path(__file__).resolve().parent.parent / 'test-results'
records = []
for origin, paths in [
    ('http://127.0.0.1:8000', ['/api/company/', '/api/solutions/', '/api/projects/', '/api/homepage/', '/sitemap.xml']),
    ('https://twinpeaksinvestment.com', ['/', '/robots.txt', '/sitemap.xml', '/solutions', '/projects']),
    ('https://backend.twinpeaksinvestment.com', ['/api/company/', '/api/solutions/', '/api/projects/', '/api/homepage/', '/sitemap.xml']),
]:
    for path in paths:
        item = {'url': origin + path, 'method': 'GET'}
        try:
            started = time.perf_counter()
            with urlopen(Request(item['url'], headers={'User-Agent': 'TwinPeaks-Phase4-ReadOnly-QA', 'Origin': 'https://twinpeaksinvestment.com'}), timeout=12) as response:
                raw = response.read(2_000_000).decode('utf-8', errors='replace')
                item.update(status=response.status, final_url=response.url, duration_ms=round((time.perf_counter()-started)*1000), headers={k:response.headers.get(k) for k in ['Content-Type','Cache-Control','Referrer-Policy','Content-Security-Policy','X-Robots-Tag','Access-Control-Allow-Origin','Access-Control-Expose-Headers']})
                if path.startswith('/api/'):
                    item['body'] = json.loads(raw)
                elif path.endswith('.xml') or path.endswith('.txt'):
                    item['body'] = raw
                else:
                    import re
                    item['title'] = re.findall(r'<title>(.*?)</title>', raw, flags=re.S)
                    item['canonical'] = re.findall(r'<link[^>]+rel=["\']canonical["\'][^>]+>', raw)
        except HTTPError as error: item['status'] = error.code
        except Exception as error: item['error_type'] = type(error).__name__
        records.append(item)
        print(item['url'], item.get('status', item.get('error_type')))
(out / 'phase4-content-and-live-url-evidence.json').write_text(json.dumps(records, indent=2), encoding='utf-8')
