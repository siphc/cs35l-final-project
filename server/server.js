const app = require('./app');

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log('=================================');
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV}`);
  console.log(`✓ API URL: http://localhost:${PORT}`);
  console.log('=================================');
});