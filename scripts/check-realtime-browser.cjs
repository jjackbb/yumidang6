const fs = require("fs");
const assert = require("assert/strict");
const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE ||
    "/Users/b/.npm/_npx/e41f203b7505f1fb/node_modules/playwright",
);

const base = process.env.CHECK_URL || "http://127.0.0.1:3024";
const cookieFile = process.env.CHECK_COOKIE_FILE;
const bypassCookies = cookieFile
  ? fs.readFileSync(cookieFile, "utf8").split("\n")
      .filter(line => line && (!line.startsWith("#") || line.startsWith("#HttpOnly_")))
      .map(line => {
        const fields = line.replace(/^#HttpOnly_/, "").split("\t");
        return {
          domain: fields[0],
          path: fields[2],
          secure: fields[3] === "TRUE",
          name: fields[5],
          value: fields[6],
          httpOnly: line.startsWith("#HttpOnly_"),
        };
      })
  : [];

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      process.env.BROWSER_EXECUTABLE ||
      "/Users/b/Library/Caches/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-mac-arm64/chrome-headless-shell",
  });
  const pageErrors = [];

  async function login(index) {
    const context = await browser.newContext();
    if (bypassCookies.length) await context.addCookies(bypassCookies);
    const page = await context.newPage();
    page.setDefaultTimeout(30000);
    page.on("pageerror", error => pageErrors.push(error.message));
    await page.goto(`${base}/chat`, { waitUntil: "domcontentloaded" });
    assert.equal(await page.getByText("서버에서 데이터를 불러오고 있어요…", { exact: true }).count(), 0);
    await page.getByLabel("테스트 번호", { exact: true }).selectOption(`0100000000${index}`);
    await page.getByLabel("테스트 인증번호", { exact: true }).fill("123456");
    await page.getByRole("button", { name: "테스트 로그인", exact: true }).click();
    await page.locator('[data-chat-realtime="connected"]').waitFor();
    await page.locator("[data-room-id]").first().waitFor();
    return { context, page };
  }

  const first = await login(1);
  const second = await login(2);
  const roomIds = async page => page.locator("[data-room-id]").evaluateAll(nodes =>
    nodes.map(node => node.getAttribute("data-room-id")).filter(Boolean),
  );
  const firstRooms = await roomIds(first.page);
  const secondRooms = await roomIds(second.page);
  const roomId = firstRooms.find(id => secondRooms.includes(id));
  assert.ok(roomId, "the test accounts need a shared room");

  await first.page.locator(`[data-room-id="${roomId}"]`).click();
  await second.page.locator(`[data-room-id="${roomId}"]`).click();
  const message = `실시간 채팅 ${Date.now()}`;
  await first.page.getByPlaceholder("메시지를 입력하세요...").fill(message);
  const sentAt = Date.now();
  await first.page.getByRole("button", { name: "메시지 보내기", exact: true }).click();
  await Promise.all([
    first.page.getByText(message, { exact: true }).waitFor(),
    second.page.getByText(message, { exact: true }).waitFor(),
  ]);
  const realtimeLatencyMs = Date.now() - sentAt;
  assert.ok(realtimeLatencyMs < 5000, `realtime delivery took ${realtimeLatencyMs}ms`);
  assert.deepEqual(pageErrors, []);

  const evidence = {
    checkedAt: new Date().toISOString(),
    base,
    roomId,
    realtimeLatencyMs,
    cases: [
      "app shell renders without the full-screen data wait message",
      "both authenticated participants subscribe to chat realtime",
      "message reaches both browsers without reload",
    ],
    pageErrors,
  };
  fs.writeFileSync(
    process.env.EVIDENCE_FILE || "docs/database/evidence/realtime-browser.json",
    JSON.stringify(evidence, null, 2),
  );
  console.log(JSON.stringify(evidence, null, 2));
  await Promise.all([first.context.close(), second.context.close()]);
  await browser.close();
})().catch(error => {
  console.error(error.stack);
  process.exit(1);
});
