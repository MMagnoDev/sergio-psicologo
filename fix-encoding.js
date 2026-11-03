const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/mailton.silva/Downloads/sergio_pis';
const files = ['index.html', 'sobre.html', 'contato.html'];

files.forEach(file => {
  const filePath = path.join(dir, file);
  // Read as raw bytes
  const buf = fs.readFileSync(filePath);
  
  // Decode as UTF-8 first (this gives us the mojibake string)
  let text = buf.toString('utf8');
  
  // Fix double-encoded UTF-8: decode the mojibake by treating it as latin1 then re-interpreting as UTF-8
  // The pattern is: original UTF-8 bytes were interpreted as latin1, then re-encoded as UTF-8
  // So we need to: decode current UTF-8 -> get the characters -> encode as latin1 -> decode as UTF-8
  const latin1Buf = Buffer.from(text, 'latin1');
  
  // Try to decode as UTF-8
  try {
    const fixed = latin1Buf.toString('utf8');
    // Verify it looks correct by checking for common Portuguese words
    if (fixed.includes('Sérgio') || fixed.includes('psicó') || fixed.includes('ção')) {
      fs.writeFileSync(filePath, fixed, 'utf8');
      console.log(`FIXED: ${file} - found correct accented chars`);
    } else {
      console.log(`SKIP: ${file} - fix didn't produce expected result, trying alternative...`);
      // Alternative: maybe it needs double-fix
      const latin1Buf2 = Buffer.from(fixed, 'latin1');
      const fixed2 = latin1Buf2.toString('utf8');
      if (fixed2.includes('Sérgio') || fixed2.includes('psicó')) {
        fs.writeFileSync(filePath, fixed2, 'utf8');
        console.log(`FIXED (2x): ${file}`);
      } else {
        console.log(`FAILED: ${file} - could not fix encoding`);
      }
    }
  } catch (e) {
    console.error(`ERROR: ${file} - ${e.message}`);
  }
});
