// Browser integration tests with simulated Auth responses. No email or real account is created.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/Users/b/.npm/_npx/e41f203b7505f1fb/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.CHECK_URL || 'http://127.0.0.1:3018';
const prototypeBase = process.env.PROTOTYPE_URL || 'http://127.0.0.1:3017';
const result = { scope: 'SIMULATED_AUTH browser integration', cases: [], pageErrors: [] };
const user = { id: '11111111-1111-4111-8111-111111111111', aud: 'authenticated', role: 'authenticated', phone: '821000000001', phone_confirmed_at: new Date().toISOString(), created_at: new Date().toISOString(), user_metadata: {}, app_metadata: { provider: 'phone' } };
const jwt = [Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'), Buffer.from(JSON.stringify({ sub: user.id, aud: 'authenticated', role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url'), 'test-signature'].join('.');
const session = { access_token: jwt, refresh_token: 'test-refresh', token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user };
const storageKey = 'sb-auth-test-auth-token';

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE || '/Users/b/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell' });
  async function run(name, test) {
    if (process.env.AUTH_CASE_FILTER && !name.includes(process.env.AUTH_CASE_FILTER)) return;
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const calls = []; const control = { rejectUser: false, userDelay: 0, rejectLogout: false, providerDisabled: false };
    await context.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url());
      if (url.origin === base || url.origin === prototypeBase) return route.continue();
      if (url.hostname !== 'auth-test.supabase.co') return route.abort();
      calls.push({ path: url.pathname, method: request.method(), body: request.postDataJSON() });
      const json = (status, body) => route.fulfill({ status, contentType: 'application/json', headers: { 'x-supabase-api-version': '2024-01-01', 'access-control-expose-headers': 'X-Supabase-Api-Version' }, body: JSON.stringify(body) });
      if (url.pathname.endsWith('/user')) {
        if (control.userDelay) await new Promise(resolve => setTimeout(resolve, control.userDelay));
        return control.rejectUser ? json(401, { code: 'bad_jwt', msg: 'invalid' }) : json(200, user);
      }
      if (url.pathname.endsWith('/otp')) return control.providerDisabled ? json(400, { code: 'phone_provider_disabled', msg: 'disabled' }) : json(200, { message_id: 'test-sms' });
      if (url.pathname.endsWith('/verify')) return request.postDataJSON().token === '123456' ? json(200, session) : json(403, { code: 'otp_expired', msg: 'Invalid token' });
      if (url.pathname.endsWith('/token')) return json(200, session);
      if (url.pathname.endsWith('/logout')) return control.rejectLogout ? json(500, { msg: 'offline' }) : route.fulfill({ status: 204 });
      throw new Error(`Unexpected Auth request: ${url.pathname}`);
    });
    const page = await context.newPage(); page.setDefaultTimeout(10000);
    page.on('pageerror', error => result.pageErrors.push(error.message));
    try { await test({ page, context, calls, control }); result.cases.push({ name, status: 'PASS' }); }
    catch (error) { result.cases.push({ name, status: 'FAIL', error: error.message, alerts: await page.getByRole('alert').allTextContents() }); }
    finally { await context.close(); }
  }
  async function login(page) {
    await page.getByLabel('휴대폰 번호', { exact: true }).fill('01000000001');
    await page.getByRole('button', { name: '인증번호 발송', exact: true }).click();
    await page.getByLabel('인증번호 6자리', { exact: true }).fill('123456');
    await page.getByRole('button', { name: '인증 확인 및 로그인', exact: true }).click();
  }
  try {
    await run('prototype: test code, rejected wrong code, intended destination, reload and logout', async ({ page, calls }) => {
      await page.goto(prototypeBase + '/chat');
      await page.waitForURL('**/login?next=%2Fchat');
      await page.getByText('프로토타입 · 테스트 인증번호 123456 · 실제 문자 발송 없음').waitFor();
      await page.getByRole('button', { name: '인증번호 발송', exact: true }).click();
      await page.locator('#auth-otp').fill('000000');
      await page.getByRole('button', { name: '인증 확인 및 로그인', exact: true }).click();
      await page.getByText('인증번호가 맞지 않아요. 다시 입력하거나 재발송해 주세요.').waitFor();
      await page.getByRole('button', { name: '테스트코드 입력', exact: true }).click();
      await page.getByRole('button', { name: '인증 확인 및 로그인', exact: true }).click();
      await page.waitForURL(prototypeBase + '/chat');
      await page.reload(); await page.locator('#nav-tab-me').click();
      await page.getByRole('button', { name: '로그아웃', exact: true }).click();
      await page.waitForURL(prototypeBase + '/');
      await page.goto(prototypeBase + '/me'); await page.waitForURL('**/login?next=%2Fme');
      assert.equal(calls.length, 0);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    });
    await run('prototype: signup with a test code persists the new member without external requests', async ({ page, calls }) => {
      await page.goto(prototypeBase + '/login?next=%2Fme');
      await page.getByRole('button', { name: /휴대폰 본인인증으로 가입/ }).click();
      await page.getByLabel('전체 약관에 동의합니다').check();
      await page.getByRole('button', { name: '동의하고 다음으로' }).click();
      await page.locator('#auth-phone').fill('01099998888');
      await page.getByRole('button', { name: '인증번호 발송', exact: true }).click();
      await page.getByRole('button', { name: '테스트코드 입력', exact: true }).click();
      await page.getByRole('button', { name: '인증 확인 및 계속하기', exact: true }).click();
      await page.locator('#auth-name').fill('테스트');
      await page.locator('#auth-birth').fill('1998-04-12');
      await page.getByRole('button', { name: '여성', exact: true }).click();
      await page.getByRole('button', { name: '가입하고 프로필 만들기', exact: true }).click();
      await page.waitForURL(prototypeBase + '/me');
      await page.reload();
      await page.getByRole('button', { name: '로그아웃', exact: true }).waitFor();
      assert.equal(calls.length, 0);
    });
    await run('prototype: public navigation works without login and cancel returns home', async ({ page, calls }) => {
      await page.goto(prototypeBase + '/explore');
      assert.equal(await page.getByRole('dialog', { name: '휴대폰 로그인' }).count(), 0);
      await page.locator('#nav-tab-me').click(); await page.waitForURL('**/login?next=%2Fme');
      await page.getByRole('button', { name: '로그인 창 닫기', exact: true }).click(); await page.waitForURL(prototypeBase + '/');
      assert.equal(calls.length, 0);
    });
    await run('Supabase: OTP error then login, return route, reload, logout and history', async ({ page, calls }) => {
      await page.goto(base + '/chat'); await page.waitForURL('**/login?next=%2Fchat');
      assert.equal(await page.getByRole('button', { name: '테스트코드 입력', exact: true }).count(), 0);
      await page.getByLabel('휴대폰 번호', { exact: true }).fill('010-0000-0001');
      await page.getByRole('button', { name: '인증번호 발송', exact: true }).click();
      await page.getByLabel('인증번호 6자리', { exact: true }).fill('000000');
      await page.getByRole('button', { name: '인증 확인 및 로그인', exact: true }).click();
      await page.getByText('인증번호가 맞지 않거나 유효 시간이 지났어요. 확인하거나 새 번호를 요청해 주세요.').waitFor();
      assert.equal(calls.find(call => call.path.endsWith('/otp')).body.phone, '+821000000001');
      assert.equal(calls.find(call => call.path.endsWith('/otp')).body.create_user, false);
      await page.getByLabel('인증번호 6자리', { exact: true }).fill('123456');
      await page.getByRole('button', { name: '인증 확인 및 로그인', exact: true }).click(); await page.waitForURL(base + '/chat');
      await page.reload(); await page.getByRole('region', { name: '로그인 확인' }).waitFor({ state: 'detached' });
      await page.locator('#nav-tab-me').click();
      await page.getByRole('button', { name: '로그아웃', exact: true }).click(); await page.waitForURL(base + '/');
      await page.goBack(); await page.waitForURL('**/login?next=%2Fchat');
    });
    await run('Supabase: signup creates no session until OTP verification; editing phone clears challenge', async ({ page, calls }) => {
      await page.goto(base + '/login?next=%2Fme');
      await page.getByRole('button', { name: '계정이 없나요? 회원가입' }).click();
      await page.getByRole('checkbox').check();
      await page.getByLabel('휴대폰 번호', { exact: true }).fill('01000000001');
      await page.getByRole('button', { name: '인증번호 발송', exact: true }).click();
      await page.getByLabel('인증번호 6자리', { exact: true }).waitFor();
      assert.equal(calls.find(call => call.path.endsWith('/otp')).body.create_user, true);
      assert.equal(await page.evaluate(key => localStorage.getItem(key), storageKey), null);
      await page.getByLabel('휴대폰 번호', { exact: true }).fill('01000000002');
      assert.equal(await page.getByLabel('인증번호 6자리', { exact: true }).count(), 0);
    });
    await run('Supabase: forged stored identity is rejected before private UI is rendered', async ({ page, context, control }) => {
      control.rejectUser = true; control.userDelay = 400;
      await context.addInitScript(({ key, session }) => localStorage.setItem(key, JSON.stringify(session)), { key: storageKey, session });
      await page.goto(base + '/me'); await page.getByText('로그인 상태를 확인하고 있어요', { exact: true }).waitFor();
      assert.equal(await page.getByRole('button', { name: '로그아웃', exact: true }).count(), 0);
      await page.waitForURL('**/login?next=%2Fme');
    });
    await run('Supabase: sign out in another tab closes private screens', async ({ page, context }) => {
      await page.goto(base + '/login?next=%2Fme'); await login(page); await page.waitForURL(base + '/me');
      const other = await context.newPage(); await other.goto(base + '/me');
      await other.getByRole('button', { name: '로그아웃', exact: true }).click();
      await page.waitForURL('**/login?next=%2Fme');
      assert.equal(await page.getByRole('button', { name: '로그아웃', exact: true }).count(), 0);
    });
    await run('Supabase: server logout failure clears local session and reports the limitation', async ({ page, control }) => {
      await page.goto(base + '/login?next=%2Fme'); await login(page); await page.waitForURL(base + '/me');
      control.rejectLogout = true;
      await page.getByRole('button', { name: '로그아웃', exact: true }).click();
      await page.getByText('이 기기에서는 로그아웃했어요. 서버의 세션 종료는 확인하지 못했어요.').waitFor();
      await page.waitForURL(base + '/');
      assert.equal(await page.evaluate(key => localStorage.getItem(key), storageKey), null);
    });
    await run('Supabase: disabled phone provider never shows a successful send or OTP input', async ({ page, control }) => {
      control.providerDisabled = true;
      await page.goto(base + '/login');
      await page.getByLabel('휴대폰 번호', { exact: true }).fill('01000000001');
      await page.getByRole('button', { name: '인증번호 발송', exact: true }).click();
      await page.getByText('휴대폰 로그인 서비스가 아직 준비되지 않았어요. 잠시 후 다시 이용해 주세요.').waitFor();
      assert.equal(await page.getByLabel('인증번호 6자리', { exact: true }).count(), 0);
    });
    await run('explicit demo remains isolated even in Supabase mode', async ({ page, calls }) => {
      await page.goto(base + '/?demo=1');
      const panel = page.getByRole('region', { name: '체험 설정', exact: true }); await panel.waitFor();
      const toggle = panel.getByRole('button', { name: /체험 설정/ });
      if (await toggle.getAttribute('aria-expanded') !== 'true') await toggle.click();
      await page.locator('[data-demo-user]').first().click(); await page.locator('#nav-tab-me').click();
      await page.getByRole('button', { name: '로그아웃', exact: true }).waitFor();
      assert.equal(calls.length, 0);
    });
  } finally { await browser.close(); }
  result.status = result.cases.every(item => item.status === 'PASS') && !result.pageErrors.length ? 'PASS' : 'FAIL';
  if (process.env.EVIDENCE_FILE) fs.writeFileSync(process.env.EVIDENCE_FILE, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== 'PASS') process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
