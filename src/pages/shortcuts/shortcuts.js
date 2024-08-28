console.info('shortcuts.js begin', window?.location?.href);

import {
  getStorageItems,
  addPendingRequest,
  createHashArgs,
  millisecondsAhead,
  sleep,
  minutesBetween,
} from '@ahstream/hx-lib';

import { VALID_URLS, getShortcuts } from './config.js';

getStorageItems(['options']).then((storage) => {
  mountShortcuts(getShortcuts(storage), VALID_URLS);
});

async function mountShortcuts(shortcuts, approvedUrls) {
  if (!shortcuts) {
    return;
  }

  const params = new URL(window.location.href).searchParams;
  //console.info('params:', params);
  const cmd = params.get('cmd') || null;
  const url = params.get('url') || null;
  const action = params.get('action') || null;

  console.info('Run shortcut:', cmd, url, window?.location?.href);

  for (let item of shortcuts) {
    if (cmd === item.cmd) {
      console.info('Run cmd:', cmd);
      await waitForDelay();
      return item.callback();
    }
  }

  if (!url) {
    console.warn('Missing cmd and url:', window?.location?.href);
    return;
  }

  if (isApprovedUrl(url, approvedUrls)) {
    console.info('Open pending url:', url);
    await addPendingRequest(url, { cmd, action });
    window.location.href = url;
  } else {
    console.warn('Unapproved url:', url);
  }
}

// HELPERS

let delayUntil = null;

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
  delayUntil = runAt;

  const span = document.createElement('span');
  span.id = 'delay-msg';
  span.style.fontSize = '2.8em';
  span.style.textAlign = 'center';
  span.style.width = '100%';
  span.style.display = 'block';
  span.style.paddingTop = '20%';
  document.body.style.backgroundColor = 'orange';
  document.body.appendChild(span);
  updateDelayMsg();
  await sleep(delaySecs * 1000);
}

function updateDelayMsg() {
  const m = minutesBetween(new Date(), delayUntil);
  const runAtStr = delayUntil.toLocaleTimeString();
  document.getElementById('delay-msg').innerText = `Delay run of shortcut ${m} minutes until ${runAtStr}`;
  setTimeout(updateDelayMsg, 60 * 1000);
}

function isApprovedUrl(url, approvedUrls) {
  //console.info('isApprovedUrl; url, approvedUrls:', url, approvedUrls);
  if (!Array.isArray(approvedUrls)) {
    // No list of URLS -> all urls are approved!
    return true;
  }
  if (!approvedUrls?.length) {
    // Empty list of URLS -> no urls are approved!
    return false;
  }
  for (let re of approvedUrls) {
    //console.log('url.match(re):', url.match(re), re);
    if (url.match(re)) {
      return true;
    }
  }
  return false;
}
