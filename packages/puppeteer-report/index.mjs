if (/jenkins/.test(process.env.PLATFORM)) {
  process.env.GLOBAL_AGENT_HTTP_PROXY = "";
  process.env.GLOBAL_AGENT_HTTPS_PROXY = "";
  process.env.GLOBAL_AGENT_NO_PROXY = "";
}

import "global-agent/bootstrap.js";
import SauceLabs from "saucelabs";
import AbortController from "abort-controller";
import fetch from "node-fetch";
import path from "path";
import puppeteer from "puppeteer";
import mkdirp from "mkdirp";

const RUN_ON_SAUCELABS = false;

(async () => {
  const puppeteerArgs = [];

  if (process.env.PROXY_HTTP)
    puppeteerArgs.push(`--proxy-server=${process.env.PROXY_HTTP}`);

  mkdirp.sync(path.join(process.cwd(), ".tmp"));
  mkdirp.sync(path.join(process.cwd(), ".tmp/ChromeSession"));

  const browser = await puppeteer.launch({
    headless: true,
    ignoreHTTPSError: true,
    executablePath: "/Applications/Chromium.app/Contents/MacOS/Chromium",
    userDataDir: path.join(process.cwd(), ".tmp/ChromeSession"),
    handleSIGINT: false,
    args: [].concat(puppeteerArgs),
  });

  const screenshotSaveToPath = path.join(process.cwd(), ".tmp/testing.png");

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("https://webdriver.io/", {
    waitUntil: "networkidle0",
    timeout: 0,
  });
  await page.screenshot({ path: screenshotSaveToPath, fullPage: true });

  await browser.close();
})().catch(async (e) => {
  console.error(e);
});
