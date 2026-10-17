// Development only. Run: node --test test.cjs
const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const ctx = {TextEncoder, TextDecoder};
vm.createContext(ctx);
vm.runInContext(html.match(/<script id="app">([\s\S]*?)<\/script>/)[1], ctx);
const C = ctx.IMRCore;
const plain = x => JSON.parse(JSON.stringify(x));
test('sample observations match the independent answer key exactly', () => {
  const result = C.analyse(fs.readFileSync(__dirname+'/sample_imr.csv','utf8'));
  assert.equal(result.length,9);
  assert.equal(result.flatMap(c=>c.charts).length,18);
  const actual = C.parseCSV(C.observationsCSV(result));
  const expected = C.parseCSV(fs.readFileSync(__dirname+'/sample_answer_key.csv','utf8'));
  assert.deepEqual(plain(actual),plain(expected));
  assert.equal(actual.length,49);
});
const lines = {'-3':-3,'-2':-2,'-1':-1,0:0,1:1,2:2,3:3};
const detect = values => C.detect(values,values.map((_,i)=>i+1),lines,'test','I');
test('strict boundaries, tolerance and eight same-side points', () => {
  assert.equal(detect([3,3+1e-10,-3]).filter(o=>o.rule_no===1).length,0);
  assert.equal(detect([3+1e-7]).filter(o=>o.rule_no===1).length,1);
  const eight = detect(Array(8).fill(1.5));
  assert.equal(eight.filter(o=>o.rule_no===2).length,0);
  assert.equal(eight.filter(o=>o.rule_no===8).length,1);
  assert.equal(detect(Array(15).fill(1)).filter(o=>[7,8].includes(o.rule_no)).length,0);
});
test('maximal runs, shared turning points, overlapping-window membership', () => {
  assert.equal(detect(Array(20).fill(.5)).filter(o=>o.rule_no===2).length,1);
  const turns=detect([0,1,2,3,4,5,4,3,2,1,0]).filter(o=>o.rule_no===3);
  assert.deepEqual(plain(turns.map(o=>o.points)),[[1,2,3,4,5,6],[6,7,8,9,10,11]]);
  const r5=detect([2.5,0,2.5,0,2.5]).filter(o=>o.rule_no===5);
  assert.equal(r5.length,1);
  assert.deepEqual(plain(r5[0].points),[1,3,5]);
  assert.deepEqual(plain(r5[0].span),[1,5]);
});
test('CSV parsing, aggregated validation and column rejection', () => {
  assert.deepEqual(plain(C.parseCSV('\ufeffa,b\r\n"one,two","x""y"\r\n')),[['a','b'],['one,two','x"y']]);
  assert.throws(()=>C.analyse('IMR_Field_a\n1\nNaN\n\n'),/V08/);
  assert.throws(()=>C.analyse('IMR_Field_a\n1\n2\n'),/V09/);
  assert.throws(()=>C.analyse('IMR_Field_a,IMR_Field_a\n1,2\n2,3\n3,4'),/V06/);
  assert.throws(()=>C.analyse('IMR_Field_a,Notes\n1\n2,bad\n3,ok'),/V07/);
  const rejected=C.analyse('IMR_Field_a,IMR_Field_b\n1,1\n1,2\n1,3');
  assert.deepEqual(plain(rejected.map(c=>c.code)),['V10','V11']);
});
test('statistics and moving-range alignment', () => {
  const c=C.analyse('IMR_Field_a\n1\n2\n4\n8')[0];
  assert.equal(c.charts[0].stats.mean,3.75);
  assert.deepEqual(plain(c.charts[1].points),[2,3,4]);
  assert.deepEqual(plain(c.charts[1].values),[1,2,4]);
  assert.ok(Math.abs(c.charts[1].stats.sd-Math.sqrt(7/3))<1e-12);
});
test('app has no external runtime dependencies', () => {
  assert.doesNotMatch(html,/<script[^>]*\bsrc=|<link[^>]*href=|\bfetch\(|XMLHttpRequest|WebSocket\(/i);
});
test('sample SD is accurate for a small spread around a large offset', () => {
  assert.equal(C.stats([1e16,1e16+2,1e16+4]).sd,2);
  assert.equal(C.stats([4,4,4]).sd,0);
  assert.equal(C.stats([4,4,4]).mean,4);
});
for(const [rule,positive,negative] of [
  [2,Array(9).fill(.5),Array(8).fill(.5)],
  [3,[0,1,2,3,4,5],[0,1,2,3,4]],
  [4,Array.from({length:14},(_,i)=>i%2),Array.from({length:13},(_,i)=>i%2)],
  [5,[2.5,0,2.5],[2.5,0,0]],
  [6,[1.5,1.5,0,1.5,1.5],[1.5,1.5,0,1.5,0]],
  [7,Array(15).fill(.5),Array(14).fill(.5)],
  [8,Array(8).fill(1.5),Array(7).fill(1.5)]
])test(`Rule ${rule}: threshold, below threshold, opposite side`,()=>{
  assert.equal(detect(positive).filter(o=>o.rule_no===rule).length,1);
  assert.equal(detect(negative).filter(o=>o.rule_no===rule).length,0);
  assert.equal(detect(positive.map(v=>-v)).filter(o=>o.rule_no===rule).length,1);
});
test('trend ties break runs and same-side windows stay separate',()=>{
  assert.equal(detect([0,1,2,2,3,4,5]).filter(o=>o.rule_no===3).length,0);
  const r5=detect([2.5,2.5,0,0,0,0,-2.5,-2.5]).filter(o=>o.rule_no===5);
  assert.equal(r5.length,2);
  assert.deepEqual(plain(r5.map(o=>o.direction)),['above','below']);
});
test('CSV quoted newlines, escaped quotes, ignored text and malformed quoting',()=>{
  assert.deepEqual(plain(C.parseCSV('a,b\n"x\ny","z""z"')),[['a','b'],['x\ny','z"z']]);
  assert.throws(()=>C.parseCSV('a\n"unfinished'),/closing quote/);
  assert.throws(()=>C.parseCSV('a\n"closed"oops'),/closing quote/);
  assert.equal(C.analyse('IMR_Field_a,Notes\n1,ignore\n2,"a,b"\n5,whatever').length,1);
});
