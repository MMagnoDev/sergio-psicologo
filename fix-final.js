const fs = require('fs');
const dir = 'c:/Users/mailton.silva/Downloads/sergio_pis/';
const files = ['index.html', 'sobre.html', 'contato.html'];

files.forEach(f => {
  let t = fs.readFileSync(dir + f, 'utf8');
  
  // 1. Clean up CSS comment decorators - replace broken emoji/decorators with simple dashes
  // Pattern: /* followed by broken chars then section name then broken chars then */
  t = t.replace(/\/\*[^*]*?\*\//g, (match) => {
    // If the comment contains mostly control/broken chars, clean it up
    // Extract the section name if any
    const sectionMatch = match.match(/(?:Reset|Lenis|REVEAL|NAV|HERO|ABOUT|SERVICES|ELEVATE|TESTIMONIAL|FAQ|FOOTER|DIVIDER|RESPONSIVE|HAMBURGER|PAGE|BIO|PILLARS|SESSION|CONTACT|FORM|QUICK|MODAL)/i);
    if (sectionMatch) {
      const name = sectionMatch[0];
      return `/* ── ${name} ${'─'.repeat(Math.max(1, 40 - name.length))} */`;
    }
    // If it's a simple comment without broken chars, keep it
    if (!/[\x00-\x1f]/.test(match) && !/\uFFFD/.test(match)) {
      return match;
    }
    // Otherwise clean control chars from it
    return match.replace(/[\x00-\x08\x0e-\x1f\x7f-\x9f\uFFFD]/g, '');
  });
  
  // 2. Fix remaining control characters outside comments
  // \x1c and \x1d that should be en-dash/em-dash
  t = t.replace(/\x1c/g, '–');
  t = t.replace(/\x1d/g, '–');
  
  // 3. Fix any remaining replacement characters
  t = t.replace(/\uFFFD/g, '');
  
  // 4. Clean up any double dashes or spaces from the replacements
  t = t.replace(/ –– /g, ' – ');
  t = t.replace(/––/g, '–');
  
  // 5. Fix the "checkmark" character that might be broken
  // Original was ✓ (U+2713)
  t = t.replace(/\u0013/g, '✓');
  
  fs.writeFileSync(dir + f, t, 'utf8');
  
  // Verify
  const verify = fs.readFileSync(dir + f, 'utf8');
  const badCount = (verify.match(/[\x00-\x08\x0e-\x1f\x7f-\x9f]/g) || []).length;
  console.log(`${f}: ${badCount} remaining bad chars`);
  
  // Show a sample of text to verify accents
  const titleMatch = verify.match(/<title>([^<]+)<\/title>/);
  if (titleMatch) console.log(`  title: ${titleMatch[1]}`);
});
