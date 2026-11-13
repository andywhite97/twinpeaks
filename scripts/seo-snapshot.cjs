// Fetch only public content. A failed API must fail the build, not publish empty pages.
const { mkdirSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const api = 'https://backend.twinpeaksinvestment.com/api/';
const data = {};
async function read(endpoint) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(api + endpoint, { signal: AbortSignal.timeout(90000) });
      if (!response.ok) throw new Error(`${endpoint}: HTTP ${response.status}`);
      return data[endpoint] = await response.json();
    } catch (error) { if (attempt === 2) throw error; }
  }
}
async function main() {
  for (const endpoint of ['company/', 'homepage/', 'solutions/', 'projects/', 'projects/?featured=true', 'blog/categories/']) await read(endpoint);
  if (!data['company/'] || !Array.isArray(data['projects/'])) throw new Error('Invalid public content response');
  for (const project of data['projects/']) await read(`projects/${encodeURIComponent(project.slug)}/`);
  const posts = [];
  for (let page = 1; ; page++) {
    if (page > 1000) throw new Error('Unexpected blog pagination');
    const result = await read(`blog/posts/?page=${page}&category=`);
    if (!Array.isArray(result.results)) throw new Error('Invalid article listing');
    posts.push(...result.results);
    if (!result.next) break;
  }
  for (const post of posts) await read(`blog/posts/${encodeURIComponent(post.slug)}/`);
  const directory = path.resolve(__dirname, '../src/app/generated');
  mkdirSync(directory, { recursive: true });
  writeFileSync(path.join(directory, 'seo-snapshot.ts'), `// Generated public build data; never import into browser code.\nexport const snapshot: Record<string, any> = ${JSON.stringify(data)};\nexport const articleSlugs: string[] = ${JSON.stringify(posts.map(post => post.slug))};\n`);
  console.log(`Loaded public content: ${posts.length} articles, ${data['projects/'].length} projects.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
