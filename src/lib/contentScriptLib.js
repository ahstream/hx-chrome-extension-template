console.info('contentScriptLib.js begin', window?.location?.href);

import { sleep, createHashArgs, loadStorage2 } from '@ahstream/hx-lib';
import { create as createStatusbar } from '@lib/statusbarLib.js';
import { echo, dispatchPage2 } from '@src/lib/hxLib.js';
import { STATUSBAR_TEXT } from '@config/constants.js';
import log from 'loglevel';

export async function startContentScriptPage({
  loglevel,
  onLoaded,
  onLoadEvents,
  storageConfig,
  statusbarConfig,
}) {
  console.log('startContentScriptPage', ...arguments);
  log.setLevel(loglevel || 'trace');
  log.info(echo('Loglevel: ' + log.getLevel()));
  Object.keys(onLoadEvents)
    .filter((x) => onLoadEvents[x])
    .forEach((x) =>
      window.addEventListener(x, (event) => onLoad(event, { onLoaded, storageConfig, statusbarConfig }))
    );
  await sleep(1);
}

async function onLoad(event, { onLoaded, storageConfig, statusbarConfig }) {
  console.info('onLoad', event, statusbarConfig);
  if (window.hxIsLoaded) {
    return console.info('Page already loaded, ignore onLoad event!');
  }
  window.hxIsLoaded = true;

  let storage = null;
  if (Array.isArray(storageConfig?.keys)) {
    storage = await loadStorage2(storageConfig);
  }
  if (!isAllowlisted(storage)) {
    console.warn('Content page is not allowlisted, do not run on this page!');
    window.hxDisabled = true;
    onLoaded(null);
    return;
  }

  let statusbar = null;
  if (statusbarConfig?.enabled) {
    statusbar = createStatusbar(
      statusbarConfig.text || STATUSBAR_TEXT,
      statusbarConfig.mountPrepend || 'body',
      statusbarConfig.buttons || [],
      {
        options: statusbarConfig.optionsBtn ?? true,
      }
    );
  }

  const pagestate = {
    log,
    storage,
    statusbar,
    hashArgs: createHashArgs(window.location.hash),
  };

  await dispatchPage2(pagestate);

  pagestate.parentTabId = pagestate.requestTabId || pagestate.hashArgs?.getOne('id') || undefined;

  onLoaded(pagestate);
}

function isAllowlisted(storage) {
  console.log(storage);

  const options = storage?.options;

  const blacklist = (options?.CONTENT_PAGE_BLACKLIST || [])
    .map((x) => x.toLowerCase().trim())
    .filter((x) => x);
  const whitelist = (options?.CONTENT_PAGE_WHITELIST || [])
    .map((x) => x.toLowerCase().trim())
    .filter((x) => x);

  console.log(blacklist, whitelist);
  console.log(blacklist.length, whitelist.length);

  if (!blacklist.length && !whitelist.length) {
    console.log('No allowlists => allowlisted = TRUE');
    return true;
  }

  const url = (window?.location?.href || '').toLowerCase();

  const isBlacklisted = !!blacklist.find((x) => x.startsWith(url));
  const isWhitelisted = !!whitelist.find((x) => x.startsWith(url));

  console.log('isBlacklisted, isWhitelisted', isBlacklisted, isWhitelisted);

  if (!blacklist.length && whitelist.length && !isWhitelisted) {
    console.warn('Empty blacklist & non-empty whitelist & not on whitelist => allowlisted = FALSE');
    return false;
  }

  if (!blacklist.length && isWhitelisted) {
    console.info('Empty blacklist & non-empty whitelist & on whitelist => allowlisted = TRUE');
    return true;
  }

  if (isBlacklisted && isWhitelisted) {
    console.info('Blacklisted + Whitelisted => allowlisted = TRUE');
    return true;
  }

  if (isBlacklisted && !isWhitelisted) {
    console.warn('Blacklisted + not Whitelisted => allowlisted = FALSE');
    return false;
  }

  console.info('Not Blacklisted + not Whitelisted => allowlisted = TRUE');
  return true;
}
