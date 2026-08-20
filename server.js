const http = require('http');

const html = `
<!DOCTYPE html>
<html>
<head><title>CSP Test Page</title></head>
<body>
  <h1 id="heading">Original Content</h1>
</body>
</html>
`;

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Content-Security-Policy': "script-src 'self'"
  });
  res.end(html);
});

server.listen(3000, () => console.log('CSP test server running on http://localhost:3000'));