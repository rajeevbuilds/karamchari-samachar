// Entry point for cPanel's "Setup Node.js App" tool (Passenger).
// Set "Application startup file" to server.js when configuring the app.
// Passenger sets PORT automatically — do not hardcode a port.

const { createServer } = require('http');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(process.env.PORT || 3000, () => {
    console.log(`Ready on port ${process.env.PORT || 3000}`);
  });
});
