var path = require('path');
try {
  var resolved = require.resolve('./src/incident/incident.module');
  console.log('Resolved to:', resolved);
} catch(e) {
  console.log('Resolve error:', e.message);
}

// Check if dist version exists
var fs = require('fs');
var distPath = path.resolve('dist/incident/incident.module.js');
console.log('Dist version exists:', fs.existsSync(distPath));
