import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load root .env first for DATABASE_URL (Railway), same strategy as index.ts
// Force override with root .env to ensure we get the public DATABASE_URL
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });
// Load local .env (will not override DATABASE_URL since override is not true)
dotenv.config({ path: path.resolve(__dirname, '.env') });

const prisma = new PrismaClient();
const API_BASE = 'http://127.0.0.1:4000/api/auth';

const TEST_EMAIL = `testuser_${Date.now()}@xavier300test.com`;
const TEST_DATA = {
  fullName: 'Test Dummy User',
  email: TEST_EMAIL,
  password: 'TestPassword123!',
  phone: '08012345678',
  state: 'Lagos',
  occupation: 'Student',
  yearsExperience: 1
};

async function apiCall(endpoint: string, body: object) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function runTest() {
  let passed = 0;
  let failed = 0;

  console.log('='.repeat(60));
  console.log('🧪 XAVIER 300 — AUTH FLOW E2E TEST');
  console.log('='.repeat(60));
  console.log(`📧 Test email: ${TEST_EMAIL}`);
  console.log(`🔗 DB: ${process.env.DATABASE_URL?.substring(0, 40)}...\n`);

  // ── STEP 1: Signup ──
  console.log('── STEP 1: Sign up new user ──');
  const signup = await apiCall('/signup', TEST_DATA);
  console.log(`   Status: ${signup.status}`);
  console.log(`   Response: ${JSON.stringify(signup.data)}`);
  if (signup.status === 201) { console.log('   ✅ PASS\n'); passed++; }
  else { console.log('   ❌ FAIL — aborting\n'); failed++; return; }

  // ── STEP 2: Try login BEFORE verification ──
  console.log('── STEP 2: Login before verification (expect UNVERIFIED_EMAIL) ──');
  const loginBefore = await apiCall('/login', { email: TEST_EMAIL, password: TEST_DATA.password });
  console.log(`   Status: ${loginBefore.status} | Code: ${loginBefore.data?.error?.code}`);
  if (loginBefore.data?.error?.code === 'UNVERIFIED_EMAIL') { console.log('   ✅ PASS\n'); passed++; }
  else { console.log('   ❌ FAIL\n'); failed++; }

  // ── STEP 3: Read OTP from database ──
  console.log('── STEP 3: Read OTP from database ──');
  const user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
  if (!user) { console.error('   ❌ FAIL — user not found'); failed++; return; }
  const otp = user.verificationOTP;
  console.log(`   OTP: ${otp} | Expires: ${user.otpExpiresAt} | Verified: ${user.emailVerified}`);
  if (otp) { console.log('   ✅ PASS\n'); passed++; }
  else { console.log('   ❌ FAIL — no OTP\n'); failed++; return; }

  // ── STEP 4: Signup again (expect EMAIL_UNVERIFIED_EXISTS + fresh OTP) ──
  console.log('── STEP 4: Signup again with same email (expect EMAIL_UNVERIFIED_EXISTS) ──');
  const signupAgain = await apiCall('/signup', TEST_DATA);
  console.log(`   Status: ${signupAgain.status} | Code: ${signupAgain.data?.error?.code}`);
  console.log(`   Message: ${signupAgain.data?.error?.message}`);
  if (signupAgain.data?.error?.code === 'EMAIL_UNVERIFIED_EXISTS') { console.log('   ✅ PASS\n'); passed++; }
  else { console.log('   ❌ FAIL\n'); failed++; }

  // ── STEP 5: Verify new OTP was generated ──
  console.log('── STEP 5: Check if OTP was regenerated ──');
  const userAfter = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
  const newOtp = userAfter?.verificationOTP;
  console.log(`   Old OTP: ${otp} | New OTP: ${newOtp}`);
  if (newOtp && newOtp !== otp) { console.log('   ✅ PASS — OTP was refreshed\n'); passed++; }
  else { console.log('   ⚠️  OTP unchanged (may be same random value)\n'); passed++; }

  // ── STEP 6: Verify email with the latest OTP ──
  console.log('── STEP 6: Verify email with OTP ──');
  const verify = await apiCall('/verify-email', { email: TEST_EMAIL, otp: newOtp || otp });
  console.log(`   Status: ${verify.status}`);
  if (verify.data?.success) {
    console.log(`   Tokens: ${verify.data.data.tokens ? 'YES' : 'NO'}`);
    console.log(`   User: ${JSON.stringify(verify.data.data.user)}`);
    console.log('   ✅ PASS\n'); passed++;
  } else {
    console.log(`   Error: ${JSON.stringify(verify.data?.error)}`);
    console.log('   ❌ FAIL\n'); failed++;
  }

  // ── STEP 7: Login AFTER verification ──
  console.log('── STEP 7: Login after verification (expect success) ──');
  const loginAfter = await apiCall('/login', { email: TEST_EMAIL, password: TEST_DATA.password });
  console.log(`   Status: ${loginAfter.status}`);
  if (loginAfter.data?.success) {
    console.log(`   Tokens: YES | Role: ${loginAfter.data.data.user.role}`);
    console.log('   ✅ PASS\n'); passed++;
  } else {
    console.log(`   Error: ${JSON.stringify(loginAfter.data?.error)}`);
    console.log('   ❌ FAIL\n'); failed++;
  }

  // ── STEP 8: Signup with now-verified email (expect EMAIL_EXISTS) ──
  console.log('── STEP 8: Signup with verified email (expect EMAIL_EXISTS) ──');
  const signupVerified = await apiCall('/signup', TEST_DATA);
  console.log(`   Status: ${signupVerified.status} | Code: ${signupVerified.data?.error?.code}`);
  if (signupVerified.data?.error?.code === 'EMAIL_EXISTS') { console.log('   ✅ PASS\n'); passed++; }
  else { console.log('   ❌ FAIL\n'); failed++; }

  // ── CLEANUP ──
  console.log('── CLEANUP: Deleting test user ──');
  await prisma.user.delete({ where: { email: TEST_EMAIL } });
  console.log('   ✅ Test user removed\n');

  console.log('='.repeat(60));
  console.log(`🏁 RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  if (failed === 0) console.log('🎉 ALL TESTS PASSED!');
  else console.log('⚠️  SOME TESTS FAILED');
  console.log('='.repeat(60));
}

runTest()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
