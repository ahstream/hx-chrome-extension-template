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
  log.info(echo('Logging started'));
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
    statusbar,
    hashArgs: createHashArgs(window.location.hash),
  };

  await dispatchPage2(pagestate);

  pagestate.parentTabId = pagestate.requestTabId || pagestate.hashArgs?.getOne('id') || undefined;

  if (Array.isArray(storageConfig?.keys)) {
    pagestate.storage = await loadStorage2(storageConfig);
  }

  onLoaded(pagestate);
}
