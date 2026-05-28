const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../../.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findFirst();
  if (!user) { console.log("no user"); return; }
  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'secret');
  
  const http = require('http');
  const req = http.get('http://localhost:4000/api/leaderboard/weekly', {
    headers: { 'Authorization': `Bearer ${token}` }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Weekly Status:', res.statusCode, 'Body:', data.substring(0, 500)));
  });
  req.on('error', console.error);

  const req2 = http.get('http://localhost:4000/api/leaderboard/previous', {
    headers: { 'Authorization': `Bearer ${token}` }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Previous Status:', res.statusCode, 'Body:', data.substring(0, 500)));
  });
  req2.on('error', console.error);
}
run();
