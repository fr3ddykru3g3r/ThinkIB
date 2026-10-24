const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const ts = require('typescript');
test('Firebase requests use the shared API for relative and absolute same-origin URLs only', () => {
 const output = ts.transpileModule(fs.readFileSync('lib/resource-url.ts','utf8'), { compilerOptions:{module:ts.ModuleKind.CommonJS} }).outputText;
 const context={exports:{},require:()=>({isWdc:true}),URL,window:{location:{origin:'https://worlddebatecollective-prep.web.app'}}};
 vm.runInNewContext(output,context);
 const url=context.exports.resourceUrl;
 assert.equal(url('/api/sat/exam'),'https://ibstuff28.vercel.app/api/sat/exam');
 assert.equal(url('https://worlddebatecollective-prep.web.app/api/forum/threads?q=math'),'https://ibstuff28.vercel.app/api/forum/threads?q=math');
 assert.equal(url('/vault/physics-topicals/a.pdf'),'https://ibstuff28.vercel.app/vault/physics-topicals/a.pdf');
 assert.equal(url('/vault/ib-booklets/a.pdf'),'/vault/ib-booklets/a.pdf');
 assert.equal(url('https://example.com/api/test'),'https://example.com/api/test');
 assert.equal(url('//example.com/api/test'),'//example.com/api/test');
});
