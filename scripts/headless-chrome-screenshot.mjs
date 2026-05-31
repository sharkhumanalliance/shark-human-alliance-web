import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";

const DEFAULT_URL = "http://127.0.0.1:3000/en";
const DEFAULT_WIDTH = 390;
const DEFAULT_HEIGHT = 900;
const DEFAULT_WAIT_MS = 1000;

function parseArgs(argv) {
  const args = {
    url: DEFAULT_URL,
    out: "tmp/headless-chrome.png",
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    deviceScaleFactor: 2,
    mobile: true,
    fullPage: false,
    waitMs: DEFAULT_WAIT_MS,
    hideCookieBanner: false,
    keepProfile: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === "--url" && next) args.url = next;
    else if (arg === "--out" && next) args.out = next;
    else if (arg === "--width" && next) args.width = Number(next);
    else if (arg === "--height" && next) args.height = Number(next);
    else if (arg === "--device-scale" && next) args.deviceScaleFactor = Number(next);
    else if (arg === "--wait" && next) args.waitMs = Number(next);
    else if (arg === "--desktop") args.mobile = false;
    else if (arg === "--mobile") args.mobile = true;
    else if (arg === "--full-page") args.fullPage = true;
    else if (arg === "--hide-cookie-banner") args.hideCookieBanner = true;
    else if (arg === "--keep-profile") args.keepProfile = true;

    if (arg.startsWith("--") && next && !next.startsWith("--")) index += 1;
  }

  if (!Number.isFinite(args.width) || args.width <= 0) {
    throw new Error("--width must be a positive number.");
  }
  if (!Number.isFinite(args.height) || args.height <= 0) {
    throw new Error("--height must be a positive number.");
  }
  if (!Number.isFinite(args.deviceScaleFactor) || args.deviceScaleFactor <= 0) {
    throw new Error("--device-scale must be a positive number.");
  }
  if (!Number.isFinite(args.waitMs) || args.waitMs < 0) {
    throw new Error("--wait must be zero or a positive number.");
  }

  return args;
}

function chromeCandidates() {
  const candidates = [];
  if (process.env.CHROME_PATH) candidates.push(process.env.CHROME_PATH);

  if (process.platform === "win32") {
    const roots = [
      process.env.PROGRAMFILES,
      process.env["PROGRAMFILES(X86)"],
      process.env.LOCALAPPDATA,
    ].filter(Boolean);

    for (const root of roots) {
      candidates.push(resolve(root, "Google/Chrome/Application/chrome.exe"));
      candidates.push(resolve(root, "Chromium/Application/chrome.exe"));
    }
  } else if (process.platform === "darwin") {
    candidates.push("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome");
    candidates.push("/Applications/Chromium.app/Contents/MacOS/Chromium");
  } else {
    candidates.push("/usr/bin/google-chrome");
    candidates.push("/usr/bin/google-chrome-stable");
    candidates.push("/usr/bin/chromium");
    candidates.push("/usr/bin/chromium-browser");
  }

  return candidates;
}

function findChrome() {
  const chromePath = chromeCandidates().find((candidate) => candidate && existsSync(candidate));
  if (!chromePath) {
    throw new Error(
      "Could not find Chrome. Set CHROME_PATH to the Chrome executable and retry.",
    );
  }
  return chromePath;
}

function requestJson(port, pathname, method = "GET") {
  const url = new URL(`http://127.0.0.1:${port}${pathname}`);
  return fetch(url, { method }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`${method} ${pathname} failed with ${response.status}`);
    }
    return response.json();
  });
}

async function waitForChrome(port) {
  const deadline = Date.now() + 10000;
  let lastError;

  while (Date.now() < deadline) {
    try {
      await requestJson(port, "/json/version");
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  throw new Error(`Chrome DevTools did not become ready: ${lastError?.message || "unknown error"}`);
}

async function createTab(port, url) {
  const encodedUrl = encodeURIComponent(url);
  try {
    return await requestJson(port, `/json/new?${encodedUrl}`, "PUT");
  } catch {
    return requestJson(port, `/json/new?${encodedUrl}`);
  }
}

function connectToTab(webSocketDebuggerUrl) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(webSocketDebuggerUrl);
    socket.addEventListener("open", () => resolve(socket), { once: true });
    socket.addEventListener("error", () => reject(new Error("Could not connect to Chrome DevTools.")), {
      once: true,
    });
  });
}

function createCommandSender(socket) {
  let nextId = 1;
  return function send(method, params = {}) {
    const id = nextId;
    nextId += 1;

    return new Promise((resolve, reject) => {
      const onMessage = (event) => {
        const message = JSON.parse(event.data.toString());
        if (message.id !== id) return;

        socket.removeEventListener("message", onMessage);
        if (message.error) {
          reject(new Error(`${method}: ${message.error.message}`));
          return;
        }
        resolve(message.result || {});
      };

      socket.addEventListener("message", onMessage);
      socket.send(JSON.stringify({ id, method, params }));
    });
  };
}

function waitForExit(processHandle, timeoutMs = 1500) {
  if (processHandle.exitCode !== null) return Promise.resolve();

  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, timeoutMs);
    processHandle.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });
  });
}

async function waitForPageLoad(socket) {
  await new Promise((resolve) => {
    const timeout = setTimeout(resolve, 5000);
    const onMessage = (event) => {
      const message = JSON.parse(event.data.toString());
      if (message.method !== "Page.loadEventFired") return;

      clearTimeout(timeout);
      socket.removeEventListener("message", onMessage);
      resolve();
    };
    socket.addEventListener("message", onMessage);
  });
}

function buildNecessaryCookieValue() {
  return encodeURIComponent(
    JSON.stringify({
      necessary: true,
      analytics: false,
      updatedAt: new Date().toISOString(),
    }),
  );
}

async function main() {
  if (typeof WebSocket === "undefined") {
    throw new Error("This script needs a Node.js runtime with global WebSocket support.");
  }

  const args = parseArgs(process.argv.slice(2));
  const chromePath = findChrome();
  const port = 9300 + Math.floor(Math.random() * 600);
  const profileDir = mkdtempSync(resolve(tmpdir(), "sha-headless-chrome-"));
  const outPath = resolve(args.out);

  mkdirSync(dirname(outPath), { recursive: true });

  const chrome = spawn(
    chromePath,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profileDir}`,
      "about:blank",
    ],
    { stdio: "ignore", windowsHide: true },
  );

  try {
    await waitForChrome(port);

    const tab = await createTab(port, "about:blank");
    const socket = await connectToTab(tab.webSocketDebuggerUrl);
    const send = createCommandSender(socket);

    await send("Page.enable");
    await send("Runtime.enable");
    await send("Network.enable");
    await send("Emulation.setDeviceMetricsOverride", {
      width: args.width,
      height: args.height,
      deviceScaleFactor: args.deviceScaleFactor,
      mobile: args.mobile,
    });
    if (args.hideCookieBanner) {
      await send("Network.setCookie", {
        expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 180,
        name: "sha_cookie_consent",
        path: "/",
        sameSite: "Lax",
        url: args.url,
        value: buildNecessaryCookieValue(),
      });
    }
    await send("Page.navigate", { url: args.url });
    await waitForPageLoad(socket);

    if (args.waitMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, args.waitMs));
    }

    const screenshot = await send("Page.captureScreenshot", {
      captureBeyondViewport: args.fullPage,
      format: "png",
      fromSurface: true,
    });

    writeFileSync(outPath, Buffer.from(screenshot.data, "base64"));
    socket.close();

    console.log(
      JSON.stringify(
        {
          ok: true,
          out: outPath,
          url: args.url,
          width: args.width,
          height: args.height,
          mobile: args.mobile,
          fullPage: args.fullPage,
          hideCookieBanner: args.hideCookieBanner,
        },
        null,
        2,
      ),
    );
  } finally {
    chrome.kill("SIGKILL");
    await waitForExit(chrome);
    if (!args.keepProfile) {
      try {
        rmSync(profileDir, { force: true, recursive: true });
      } catch (error) {
        console.warn(`Warning: could not remove temporary Chrome profile: ${error.message}`);
      }
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
