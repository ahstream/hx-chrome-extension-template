import { createStatusbar } from '@src/statusbar/statusbar.js';

export function create(
  text,
  mountPrepend,
  customButtons = [],
  defaultButtons = { options: false },
  config = {}
) {
  const optionsButton = !defaultButtons.options
    ? null
    : {
        text: 'Options',
        handler: () =>
          chrome.runtime.sendMessage({
            cmd: 'openOptionsPage',
          }),
      };

  const buttons = [...customButtons, optionsButton];
  return createStatusbar(text, { ...config, buttons, mountPrepend });
}
