import json
import os
import urllib.request

output_txt = '/Users/shivansh/.gemini/antigravity/brain/8596838b-51c0-41ac-97b8-39d81b5d124d/.system_generated/steps/18/output.txt'
out_dir = '/Users/shivansh/projects/Hub/buddyup-stitch-app/designs'
os.makedirs(out_dir, exist_ok=True)

with open(output_txt, 'r') as f:
    data = json.load(f)

for screen in data.get('screens', []):
    title = screen.get('title', 'Unknown').replace('/', '_').replace(' ', '_')
    url = screen.get('htmlCode', {}).get('downloadUrl')
    if url:
        out_path = os.path.join(out_dir, f"{title}.html")
        print(f"Downloading {title}...")
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                html = response.read()
                with open(out_path, 'wb') as out_f:
                    out_f.write(html)
        except Exception as e:
            print(f"Failed to download {title}: {e}")
