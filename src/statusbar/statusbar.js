import { createDOMElement } from '@lib/hxLib.js';

import './statusbar.scss';

export function createStatusbar(
  text,
  { buttons = [], hide = [6000, 60000], historySize = 50, mountPrepend, className } = {}
) {
  let _initialText = text;
  let _lastText;
  let _lastSubtext = '';
  const _history = [];
  const _baseClassName = `hx-statusbar navbar-top navbar navbar-expand-lg navbar-light ${
    className || ''
  }`.trim();

  const _statusbar = createStatusbarElem(buttons, hide, _baseClassName);

  mountStatusbar(_statusbar, mountPrepend);
  addText(_initialText);

  function addText(text, className = null, logger) {
    _lastText = text;
    addHistory(text);
    if (logger) {
      logger(text);
    }
    _statusbar.title = _history
      .map((x) => `${x.text} [${x.date.toLocaleTimeString()}]`)
      .reverse()
      .join('\n');
    const fullText = text + (_lastSubtext?.length ? ` (${_lastSubtext})` : '');
    document.getElementById('hx-statusbar-left-col').innerText = fullText;
    if (className) {
      _statusbar.className = `${_baseClassName} ${className}`;
    }
  }

  function addSubtext(text) {
    _lastSubtext = text;
    const fullText = _lastText + (text?.length ? ` (${text})` : '');
    document.getElementById('hx-statusbar-left-col').innerText = fullText;
  }

  function addHistory(text) {
    if (text) {
      _history.push({ text, date: new Date() });
      if (historySize && history.length > historySize) {
        _history.splice(0, historySize);
      }
    }
  }

  function addButton({ text, title, disabled, handler }) {
    document
      .getElementById('hx-statusbar-right-col')
      .prepend(createButton({ text, title, disabled, handler }));
  }

  return {
    // mount: (prependElem) => mountStatusbar(_statusbar, prependElem || 'body', _initialText),
    text: (str, className) => addText(str, className),
    subtext: (str) => addSubtext(str),
    info: (str) => addText(str, 'info'),
    mid: (str) => addText(str, 'info'),
    sub: (str) => addText(str, 'info'),
    ok: (str) => addText(str, 'ok'),
    warn: (str) => addText(str, 'warn'),
    error: (str) => addText(str, 'error'),
    button: addButton,
    buttons: (btns) => {
      document.getElementById('hx-statusbar-right-col').replaceChildren();
      btns.forEach((btn) => addButton(btn));
    },
  };
}

function createStatusbarElem(buttons, [shortHide, longHide], className) {
  const statusbar = createDOMElement('div', {
    id: 'hx-statusbar',
    className: (className || '').trim(),
  });

  const statusbarRow = createDOMElement('div', {
    className: `hx-statusbar-row navbar-top d-flex justify-content-between container`.trim(),
  });

  const statusbarLeftCol = createDOMElement('div', {
    id: 'hx-statusbar-left-col',
    className: 'hx-statusbar-left-col justify-content-start float-left navbar-collapse',
  });

  const statusbarRightCol = createDOMElement('div', {
    id: 'hx-statusbar-right-col',
    className: 'hx-statusbar-right-col justify-content-end float-right navbar-collapse',
  });

  buttons.forEach((button) => {
    statusbarRightCol.append(createButton(button));
  });
  if (!buttons.length) {
    // make sure right side is non-empty to not screw up styling!
    statusbarRightCol.append(createDOMElement('span', ''));
  }

  statusbarRow.append(statusbarLeftCol);
  statusbarRow.append(statusbarRightCol);

  statusbar.append(statusbarRow);

  statusbarLeftCol.addEventListener('click', (event) => {
    console.log('event', event);
    if (event.target.tagName === 'BUTTON') {
      // Let through clicks on buttons!
      return;
    }
    // hide long time if ctrl or shift click!
    const timeToHide = event.ctrlKey || event.shiftKey ? longHide : shortHide;
    statusbar.classList.toggle('hidden');
    setTimeout(() => {
      statusbar.classList.toggle('hidden');
    }, timeToHide);
  });

  return statusbar;
}

function mountStatusbar(statusbar, prependElem) {
  // Make sure only one statusbar is present!
  const existingStatusbar = document.querySelector('[id="hx-statusbar"]');
  if (existingStatusbar) {
    existingStatusbar.replaceWith(statusbar);
    return;
  }
  const baseElem =
    (prependElem
      ? document.getElementById(prependElem) || document.getElementsByClassName(prependElem)[0]
      : null) || document.body;
  console.log('prependElem, baseElem', prependElem, baseElem);

  baseElem.prepend(statusbar);
}

function createButton({ text, title, disabled, handler, id }) {
  const btn = createDOMElement('button', { id, title, text });
  btn.disabled = !!disabled;
  if (typeof handler === 'function') {
    btn.addEventListener('click', handler);
  } else {
    btn.disabled = true;
  }
  return btn;
}
