const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

async function renderText(inputFile, outputFile, title) {
  const content = await fs.readFile(inputFile, 'utf8');
  const lines = content.trimEnd().split(/\r?\n/).slice(0, 38);
  const lineHeight = 28;
  const height = Math.max(260, 110 + lines.length * lineHeight);
  const text = lines.map((line, index) => (
    `<text x="42" y="${108 + index * lineHeight}" fill="#d7e3f4" font-size="19" font-family="Consolas, monospace">${escapeXml(line)}</text>`
  )).join('');
  const svg = `<svg width="1500" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="1500" height="${height}" fill="#111827"/>
    <rect x="22" y="22" width="1456" height="${height - 44}" rx="8" fill="#1f2937" stroke="#52657a"/>
    <circle cx="48" cy="54" r="8" fill="#ef6b6b"/>
    <circle cx="74" cy="54" r="8" fill="#eabf63"/>
    <circle cx="100" cy="54" r="8" fill="#65c18c"/>
    <text x="130" y="61" fill="#9fb3c8" font-size="18" font-family="Arial, sans-serif">${escapeXml(title)}</text>
    ${text}
  </svg>`;

  await sharp(Buffer.from(svg)).png().toFile(outputFile);
}

async function main() {
  const screenshotDir = path.join('.', 'screenshots');
  await fs.mkdir(screenshotDir, { recursive: true });
  await renderText('test-results.txt', path.join(screenshotDir, 'api-checks.png'), 'Koa API checks');
  await renderText('server-run.txt', path.join(screenshotDir, 'server-logs.png'), 'Server request log');
}

main().catch((error) => {
  console.error(`Screenshot error: ${error.message}`);
  process.exitCode = 1;
});
