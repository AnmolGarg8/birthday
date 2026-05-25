const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<div class="cake-slice-left">\?\?<\/div>/g, '<div class="cake-slice-left">🍰</div>');
html = html.replace(/<div class="cake-slice-right">\?\?<\/div>/g, '<div class="cake-slice-right">🍰</div>');
html = html.replace(/<div class="knife-emoji">\?\?<\/div>/g, '<div class="knife-emoji">🔪</div>');
html = html.replace(/<div class="full-cake">\?\?<\/div>/g, '<div class="full-cake">🎂</div>');
fs.writeFileSync('index.html', html, 'utf8');

let css = fs.readFileSync('css/style.css', 'utf8');
css = css.replace('.cake-cut-overlay {\r\n    position: absolute;', '.cake-cut-overlay {\r\n    position: fixed;');
css = css.replace('.cake-cut-overlay {\n    position: absolute;', '.cake-cut-overlay {\n    position: fixed;');
fs.writeFileSync('css/style.css', css, 'utf8');
