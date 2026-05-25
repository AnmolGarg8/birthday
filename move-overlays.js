const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const match1 = html.match(/\s*<!-- Cake Cutting Animation -->[\s\S]*?<div class="full-cake">🎂<\/div>\s*<\/div>/);
const match2 = html.match(/\s*<!-- Blowout Success overlay card -->[\s\S]*?id="wish-success-msg"[\s\S]*?<\/button>\s*<\/div>\s*<\/div>/);

let ext1 = match1 ? match1[0] : '';
let ext2 = match2 ? match2[0] : '';

if(ext1) html = html.replace(ext1, '');
if(ext2) html = html.replace(ext2, '');

html = html.replace(/<canvas id="fireworks-canvas"><\/canvas>/, '<canvas id="fireworks-canvas"></canvas>\n' + ext1 + '\n' + ext2);

fs.writeFileSync('index.html', html, 'utf8');
