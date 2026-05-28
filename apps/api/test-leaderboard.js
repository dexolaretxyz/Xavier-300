const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../../.env' });
const token = jwt.sign({ userId: 'dummy', role: 'STUDENT' }, process.env.JWT_SECRET || 'secret');
const http = require('http');

const req = http.get('http://localhost:4000/api/leaderboard/weekly', {
  headers: { 'Authorization': `Bearer ${token}` }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', data));
});
req.on('error', console.error);
