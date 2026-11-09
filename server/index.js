import { createApp } from './app.js';

// Cloud Run provides PORT; 8080 is the local default.
const port = Number(process.env.PORT) || 8080;

createApp().listen(port, () => {
  console.log(`Portfolio server listening on port ${port}`);
});
