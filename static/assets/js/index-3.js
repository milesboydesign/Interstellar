// index.js
window.addEventListener("load", () => {
  navigator.serviceWorker.register("../sw.js?v=2025-04-15", {
    scope: "/a/",
  });
});

let xl;

try {
  xl = window.top.location.pathname === "/d";
} catch {
  try {
    xl = window.parent.location.pathname === "/d";
  } catch {
    xl = false;
  }
}

const form = document.getElementById("fv");
const input = document.getElementById("input");

if (form && input) {
  form.addEventListener("submit", async event => {
    event.preventDefault();
    try {
      if (xl) await processUrl(input.value, "");
      else await processUrl(input.value, "/d");
    } catch {
      await processUrl(input.value, "/d");
    }
  });
}
function useScramjetPxy() {
  const p = localStorage.getItem("pchoice");
  return p === "sj";
}

function isSpecialProtocolUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:";
  } catch {
    return /^(?:[a-z][a-z0-9+.-]*:)/i.test(url);
  }
}

async function getPxyUrl(url) {
  if (isSpecialProtocolUrl(url)) {
    return url;
  }

  if (useScramjetPxy()) {
    if (window.__isSjReady) {
      await window.__isSjReady;
    }
    if (window.__isSj?.encodeUrl) {
      return window.__isSj.encodeUrl(url);
    }
  }

  return `/a/${__uv$config.encodeUrl(url)}`;
}

async function processUrl(value, path) {
  let url = value.trim();
  const engine = localStorage.getItem("engine");
  const searchUrl = engine ? engine : "https://search.brave.com/search?q=";

  if (isSpecialProtocolUrl(url)) {
    // keep custom protocols like chromeos-steam:// direct instead of sending them through proxy layers
  } else if (!isUrl(url)) {
    url = searchUrl + url;
  } else if (!(url.startsWith("https://") || url.startsWith("http://"))) {
    url = `https://${url}`;
  }

  const pxyUrl = await getPxyUrl(url);
  sessionStorage.setItem("GoUrl", pxyUrl);
  const pchoice = localStorage.getItem("pchoice");

  if (pchoice === "dy") {
    window.location.href = `/a/q/${__uv$config.encodeUrl(url)}`;
  } else if (path) {
    location.href = path;
  } else {
    window.location.href = pxyUrl;
  }
}

function go(value) {
  processUrl(value, "/d");
}

function blank(value) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const protocol = url.protocol.toLowerCase();

    if (protocol.includes("steam:") || hostname.includes("steam")) {
      try {
        top.location.href = value;
      } catch {
        window.location.href = value;
      }
      return;
    }
  } catch {
    const lowerValue = value.toLowerCase();
    if (lowerValue.startsWith("steam://") || lowerValue.startsWith("chromeos-steam://")) {
      try {
        top.location.href = value;
      } catch {
        window.location.href = value;
      }
      return;
    }
    // fall back to proxy handling for malformed URLs
  }
  processUrl(value);
}

function dy(value) {
  processUrl(value, `/a/q/${__uv$config.encodeUrl(value)}`);
}

function isUrl(val = "") {
  if (/^http(s?):\/\//.test(val) || (val.includes(".") && val.substr(0, 1) !== " ")) {
    return true;
  }
  return false;
}
