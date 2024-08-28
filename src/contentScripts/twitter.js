import { startContentScriptPage } from '@lib/contentScriptLib.js';

//import { sleep } from '@ahstream/hx-lib';

// CONFIG

import '@styles/contentPages/twitter.scss';
console.info('twitter.js begin', window?.location?.href);

const LOG_LEVEL = 'debug';
//const onLoadEvents = ['/* load */', 'DOMContentLoaded'];
const onLoadEvents2 = { load: true, DOMContentLoaded: true };
const statusbarConfig = { enabled: true };

// AUTO STARTUP

const pagestate = {
  log: null,
  statusbar: null,
};

startContentScriptPage(LOG_LEVEL, onLoaded, onLoadEvents2, statusbarConfig);

async function onLoaded(log, statusbar) {
  pagestate.log = log;
  pagestate.statusbar = statusbar;
  console.info('onLoaded pagestate:', pagestate);
  runContentPage();
}

// CUSTOM STARTUP

function runContentPage() {
  console.info('runContentPage');
  pagestate.statusbar.button({ text: 'Alert', handler: () => window.alert('Alert') });
}
