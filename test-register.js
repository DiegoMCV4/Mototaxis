const http = require('http');

const data = JSON.stringify({
  fullName: 'New Test User',
  email: 'newuser' + Date.now() + '@test.com',
  password: 'password123',
  userType: 'passenger'
});

const options = {
  hostname: '3.133.144.159',
  port: 3000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', body);
  });
});

req.on('error', (error) => {
  console.error('ERROR:', error.message);
});

req.write(data);
req.end();
