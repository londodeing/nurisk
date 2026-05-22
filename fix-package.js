const fs = require('fs');
const filePath = './package.json';
let pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const entries = Object.keys(pkg.exports).filter(key => key !== '.');
for (const entry of entries) {
  if (pkg.exports[entry] && typeof pkg.exports[entry] === 'object') {
    for (const format of ['import', 'require']) {
      if (pkg.exports[entry][format]) {
        const formatObj = pkg.exports[entry][format];
        if (formatObj.types) {
          formatObj.types = formatObj.types.replace(/^(\.\/dist\/)(.+)(\.d\.ts)$/, '\\/index\');
        }
        if (formatObj.default) {
          if (formatObj.default.endsWith('.mjs')) {
            formatObj.default = formatObj.default.replace(/^(\.\/dist\/)(.+)(\.mjs)$/, '\\/index\');
          } else if (formatObj.default.endsWith('.js')) {
            formatObj.default = formatObj.default.replace(/^(\.\/dist\/)(.+)(\.js)$/, '\\/index\');
          }
        }
      }
    }
  }
}
fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2));
console.log('Updated package.json');
