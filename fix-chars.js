const fs = require('fs');

const files = ['index.html', 'sobre.html', 'contato.html'];
const dir = 'c:/Users/mailton.silva/Downloads/sergio_pis/';

files.forEach(f => {
  let t = fs.readFileSync(dir + f, 'utf8');
  let original = t;
  
  // Fix remaining triple-encoded special characters
  // These are Unicode chars that went through latin1->utf8 but were already multi-byte sequences
  
  // Common remaining mojibake patterns from double-encoded "special" chars:
  // â€" (em dash U+2014) shows as various broken sequences
  // â€" (en dash U+2013)
  // â€™ (right quote)
  
  // Find and replace control characters in 0x80-0x9F range with likely intended chars
  // \u001c = FS (file separator) - likely was part of em-dash
  // \u001d = GS (group separator) - likely was part of en-dash
  
  // Replace known broken patterns
  t = t.replace(/\u00e2\u0080\u0093/g, '–');  // en-dash
  t = t.replace(/\u00e2\u0080\u0094/g, '—');  // em-dash
  t = t.replace(/\u00e2\u0080\u0099/g, "'");   // right single quote
  t = t.replace(/\u00e2\u0080\u009c/g, '"');   // left double quote
  t = t.replace(/\u00e2\u0080\u009d/g, '"');   // right double quote
  t = t.replace(/\u00e2\u0080\u00a2/g, '•');   // bullet
  
  // Also try these patterns (after one round of fix, the â might be gone)
  t = t.replace(/\u0080\u0093/g, '–');
  t = t.replace(/\u0080\u0094/g, '—');
  t = t.replace(/\u0080\u009c/g, '"');
  t = t.replace(/\u0080\u009d/g, '"');
  
  // Check for remaining sequences with control chars near hyphens/dashes
  // Pattern: some char + \x1c or \x1d (these are remnants of broken encoding)
  // â€" as broken: might appear as char(e2) + char(80) + char(93) after partial decode
  // Or: char + \x1c/\x1d if the middle bytes got consumed
  
  // Aggressive fix: replace any word boundary dash-like control chars
  t = t.replace(/\u00e2\u001c/g, '–');
  t = t.replace(/\u00e2\u001d/g, '–');
  
  // Check for standalone control characters that shouldn't be there
  // Replace isolated \x1c, \x1d near text with dash
  t = t.replace(/\u001c(?=MG)/g, '–');
  t = t.replace(/\u001d(?= )/g, ' –');
  t = t.replace(/([a-zA-Z])\u001d/g, '$1 –');
  
  if (t !== original) {
    fs.writeFileSync(dir + f, t, 'utf8');
    console.log('FIXED: ' + f);
  } else {
    console.log('NO CHANGE: ' + f);
  }
  
  // Report remaining problematic chars
  const remaining = [];
  for (let i = 0; i < t.length; i++) {
    const code = t.charCodeAt(i);
    if (code < 0x20 && code !== 0x0A && code !== 0x0D && code !== 0x09) {
      remaining.push(`pos ${i}: U+${code.toString(16).padStart(4,'0')} near: "${t.substring(Math.max(0,i-10), i+10).replace(/\n/g,'\\n')}"`);
    }
  }
  if (remaining.length > 0) {
    console.log(`  Remaining control chars in ${f}:`);
    remaining.forEach(r => console.log('    ' + r));
  } else {
    console.log(`  ${f}: clean!`);
  }
});
