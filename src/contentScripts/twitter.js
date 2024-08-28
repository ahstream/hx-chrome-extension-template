console.info('twitter.js begin', window?.location?.href);

import { sleep } from '@ahstream/hx-lib';
import { createStatusbar } from '@src/statusbar/statusbar.js';

import '@styles/contentPages/twitter.scss';

import { echo } from '@src/lib/hxLib.js';

console.info(echo('hi'));

mountContentScript();

async function mountContentScript() {
  //window.addEventListener('load', onLoad);
  window.addEventListener('DOMContentLoaded', onLoad);
  await sleep(1);
}

async function onLoad() {
  console.log('onLoad');
  if (window.hxIsLoaded) {
    return console.log('Page already loaded, ignore onLoad event!');
  }
  window.hxIsLoaded = true;

  const optionsButton = { text: 'Options', handler: () => window.alert('Options') };
  const statusbar = createStatusbar('Chrome Extension Statusbar', {
    buttons: [optionsButton],
    className: 'container',
    prependElem: 'body',
  });
  console.log(statusbar);

  runContentScript();
}

function runContentScript() {
  console.log('runContentScript');
}
