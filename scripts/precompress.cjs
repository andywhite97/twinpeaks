// Reproducible static compression, no application dependency or image modification.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist/front-v2/browser');
assert(fs.existsSync(root),'Build the Angular browser artifact before precompressing.');
const extensions=new Set(['.js','.css','.json','.svg','.txt','.ttf']);let files=0,original=0,brotli=0,gzip=0;
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else if(extensions.has(path.extname(file))){const body=fs.readFileSync(file);if(body.length<1024)continue;const br=zlib.brotliCompressSync(body,{params:{[zlib.constants.BROTLI_PARAM_QUALITY]:9}});const gz=zlib.gzipSync(body,{level:9});
  // Verify every derivative decodes to exactly the original bytes.
  assert(zlib.brotliDecompressSync(br).equals(body));assert(zlib.gunzipSync(gz).equals(body));fs.writeFileSync(file+'.br',br);fs.writeFileSync(file+'.gz',gz);files++;original+=body.length;brotli+=br.length;gzip+=gz.length;
}}}
walk(root);console.log(JSON.stringify({files,originalBytes:original,brotliBytes:brotli,gzipBytes:gzip}));
