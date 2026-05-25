const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.split('<div class="cake-slice-left">??</div>').join('<div class="cake-slice-left">🍰</div>');
html = html.split('<div class="cake-slice-right">??</div>').join('<div class="cake-slice-right">🍰</div>');
html = html.split('<div class="knife-emoji">??</div>').join('<div class="knife-emoji">🔪</div>');
html = html.split('<div class="full-cake">??</div>').join('<div class="full-cake">🎂</div>');
fs.writeFileSync('index.html', html, 'utf8');
