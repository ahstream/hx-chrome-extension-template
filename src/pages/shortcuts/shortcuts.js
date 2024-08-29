/*
BASE_URL = chrome-extension://oodlifcpofmkpmicafoobehcmaegjkbe/shortcuts.html

These will trigger a chrome.runtime.sendMessage with args as input:

- {BASE_URL}?cmd=closeOtherTabs
- {BASE_URL}?cmd=closeTabsButOne&butOneUrl=chrome://about/

If targetUrl is present, pending request with args as input will be created, and url will be opened:

- {BASE_URL}?cmd=startSampleTask&targetUrl=https://opensea.io/
- {BASE_URL}?cmd=startSampleTask&targetUrl=https://opensea.io/&numArg=123&textArg=lorem

If delaySecs hash is present, execution will be delayed:

- {BASE_URL}?cmd=closeOtherTabs#delaySecs=5
- {BASE_URL}?cmd=startSampleTask&targetUrl=https://opensea.io/#delaySecs=60

Sample URLs:

chrome-extension://oodlifcpofmkpmicafoobehcmaegjkbe/shortcuts.html?cmd=closeOtherTabs
chrome-extension://oodlifcpofmkpmicafoobehcmaegjkbe/shortcuts.html?cmd=closeTabsButOne&url=chrome://about/
chrome-extension://oodlifcpofmkpmicafoobehcmaegjkbe/shortcuts.html?cmd=startSampleTask&targetUrl=https://opensea.io/
chrome-extension://oodlifcpofmkpmicafoobehcmaegjkbe/shortcuts.html?cmd=startSampleTask&targetUrl=https://opensea.io/&numArg=123&textArg=lorem
chrome-extension://oodlifcpofmkpmicafoobehcmaegjkbe/shortcuts.html?cmd=closeOtherTabs#delaySecs=5
chrome-extension://oodlifcpofmkpmicafoobehcmaegjkbe/shortcuts.html?cmd=startSampleTask&targetUrl=https://opensea.io/#delaySecs=60
*/

console.info('shortcuts.js begin', window?.location?.href);

import {
  addPendingRequest,
  createHashArgs,
  millisecondsAhead,
  sleep,
  minutesBetween,
} from '@ahstream/hx-lib';

runShortcut();

async function runShortcut() {
  const searchParams = new URL(window.location.href).searchParams;
  //console.info('params:', params);
  const cmd = searchParams.get('cmd') || null;
  const targetUrl = searchParams.get('targetUrl') || null;

  console.info('Run shortcut:', cmd, targetUrl, window?.location?.href);

  if (!cmd) {
    return console.warn('Missing shortcut cmd', window?.location?.href);
  }

  await waitForDelay();

  const args = {};
  for (const [key, value] of searchParams.entries()) {
    args[key] = value;
  }

  if (!targetUrl) {
    return chrome.runtime.sendMessage(args);
  }

  console.info('Open pending url:', targetUrl);
  await addPendingRequest(targetUrl, args);
  window.location.href = targetUrl;
}

// HELPERS

async function waitForDelay() {
  if (!window?.location?.hash) {
    return;
  }
  const hashArgs = createHashArgs(window.location.hash);
  //console.log(hashArgs);
  const delaySecs = hashArgs.hashArgs.delaySecs?.length ? Number(hashArgs.hashArgs.delaySecs[0]) : 0;
  if (!delaySecs) {
    return;
  }
  const runAt = new Date(millisecondsAhead(delaySecs * 1000, new Date()));
  const delayUntil = runAt;

  const span = document.createElement('span');
  span.id = 'delay-msg';
  span.style.fontSize = '2.8em';
  span.style.textAlign = 'center';
  span.style.width = '100%';
  span.style.display = 'block';
  span.style.paddingTop = '20%';
  document.body.style.backgroundColor = 'orange';
  document.body.appendChild(span);
  updateDelayMsg(delayUntil);
  await sleep(delaySecs * 1000);
  document.body.style.backgroundColor = '#38e738';
  document.getElementById('delay-msg').innerText = `Shortcut ran at ${new Date().toLocaleTimeString()}`;
}

function updateDelayMsg(delayUntil) {
  if (Date.now() >= delayUntil) {
    return;
  }
  const m = minutesBetween(new Date(), delayUntil);
  const runAtStr = delayUntil.toLocaleTimeString();
  document.getElementById('delay-msg').innerText = `Delay run of shortcut ${m} minutes until ${runAtStr}`;
  setTimeout(() => updateDelayMsg(delayUntil), 60 * 1000);
}
