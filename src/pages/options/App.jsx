import React from 'react';
import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import PageLayout from '@components/pageLayout/PageLayout.jsx';
import { loadStorage, saveStorage } from '@ahstream/hx-lib';
import './options.scss';
import config from './config.js';

const MIN_TEXT_INPUT_LENGTH = 30;
const DEFAULT_TEXTAREA_ROWS = 4;

export default function App() {
  console.log('App start, config:', config);

  const [pageInitialized, setPageInitialized] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [storage, setStorage] = useState(null);
  console.log('useState storage:', storage);

  useEffect(() => {
    async function initPage() {
      try {
        setStorage(await loadStorage({ keys: ['options'] }));
        setPageInitialized(true);
        setPageLoading(false);
        console.log('initPage storage:', storage);
      } catch (error) {
        setPageError(error);
        setPageLoading(false);
      }
    }
    initPage();
  }, []);

  const [statusVisible, setStatusVisible] = useState(false);
  const [statusText, setStatusText] = useState(true);

  async function saveForm() {
    await saveOptions(storage);
    setStatusText('Options saved');
    setStatusVisible(true);
    setTimeout(() => setStatusVisible(false), 2500);
  }

  function closeForm() {
    window.close();
  }

  return (
    <>
      {pageLoading && <span>Loading ...</span>}
      {pageError && <span className="text-red-700">{`Error: ${pageError}`}</span>}
      {pageInitialized && (
        <PageLayout pageTitle="Options">
          <Sections storage={storage} sections={config} />
          <div className="buttons-row">
            <Button onClick={saveForm}>Save</Button>
            <Button onClick={closeForm}>Close</Button>
            {statusVisible && <span id="statusText">{statusText}</span>}
          </div>
        </PageLayout>
      )}
    </>
  );
}

async function saveOptions(storage) {
  const radios = [...document.querySelectorAll('input[type="radio"]')];
  const cbs = [...document.querySelectorAll('input[type="checkbox"]')];
  const texts = [...document.querySelectorAll('input[type="text"]')];
  const textareas = [...document.querySelectorAll('textarea')];

  radios.forEach((r) => {
    if (r.checked) {
      storage.options[r.name] = r.value;
    }
  });

  cbs.forEach((cb) => {
    storage.options[cb.id] = cb.checked;
  });

  texts.forEach((text) => {
    const key = text.id;
    const val = typeof storage.options[key] === 'number' ? Number(text.value) : text.value;
    storage.options[key] = val;
  });

  textareas.forEach((textarea) => {
    const key = textarea.id;
    const val = textarea.value.split('\n').filter((x) => x.length);
    storage.options[key] = val;
  });

  await saveStorage(storage);
  console.log('saved storage', storage);
}

function Sections({ storage, sections }) {
  //console.log('Sections', ...arguments);
  if (!Date.now()) {
    return <span>foo</span>;
  }
  if (!storage?.options || !sections.length) {
    console.error('Options or config missing, exit!');
    return <span>Error: Storage options or config is missing!</span>;
  }

  return (
    <>
      <div className="options">
        {sections.map((item, index) => (
          <div key={index} className="section">
            <span className="section-header">{item.header}</span>
            <Options options={item.options} storage={storage} />
          </div>
        ))}
      </div>
    </>
  );
}

function Options({ storage, options }) {
  console.log('Options', ...arguments);

  if (!storage?.options || !options.length) {
    console.error('Options or config missing, exit!');
    return <span>Error: Storage options or config is missing!</span>;
  }

  return (
    <>
      {options.map((item, index) => (
        <Option key={index} option={item} storage={storage} />
      ))}
    </>
  );
}

function Option({ option, storage }) {
  //console.log('Option', ...arguments);

  const key = option[0];
  const val = option[1];

  if (key === 'table') {
    return (
      <table>
        <tbody>
          <Options options={val} storage={storage} />
        </tbody>
      </table>
    );
  }

  if (key === 'box') {
    return (
      <div className="option-row box">
        <Options options={val} storage={storage} />
      </div>
    );
  }

  if (key === 'subheader') {
    return (
      <div className="option-row subheader">
        <span>{val}</span>
      </div>
    );
  }

  if (key === 'description') {
    return (
      <div className="option-row description">
        <span>{val}</span>
      </div>
    );
  }

  if (key === 'property') {
    const name = option[1];
    return <>{createProperty(name, storage.options[name], option[2], option[3], option[4])}</>;
  }

  if (key === 'propertyCell') {
    const name = option[1];
    return <>{createPropertyCell(name, storage.options[name], option[2], option[3], option[4])}</>;
  }

  if (key === 'radioButtons') {
    const name = option[1];
    return <>{createRadioButtons(name, storage.options[name], option[2], option[3])}</>;
  }

  if (key === 'checkboxCombo') {
    const name1 = option[1];
    const text1 = option[2];
    const name2 = option[3];
    return <>{createCheckboxCombo(name1, storage.options[name1], text1, name2, storage.options[name2])}</>;
  }

  if (key === 'space') {
    return <div className="space" style={{ height: `${option[1]}px` }}></div>;
  }

  if (key === 'spaceCell') {
    return (
      <tr>
        <td colSpan={2} style={{ height: `${option[1]}px` }}></td>
      </tr>
    );
  }
}

// HELPER FUNCTIONS ---------------------------------------------------------------

function createRadioButtons(name, val, arr, infoText = null) {
  if (typeof val === 'undefined') {
    return <></>;
  }

  const infoIcon = makeInfoIcon(infoText);

  return (
    <div className="option-row">
      {arr.map((item) => {
        <>
          <input
            type="radio"
            id={item[0]}
            name={name}
            defaultValue={item[0]}
            defaultChecked={item[0] === val}
          />{' '}
          <label htmlFor={item[0]}>{item[1]}</label>
        </>;
      })}
      {infoIcon}
    </div>
  );
}

function createCheckboxCombo(name, val, text, name2, val2, minLength = MIN_TEXT_INPUT_LENGTH) {
  if (typeof val === 'undefined') {
    return <></>;
  }
  const labelText = typeof text === 'string' ? text : name;

  const valText = convertStringVal(val2, 'error');
  const valLength = valText.length;
  const length = valLength > minLength ? valLength : minLength;
  const typedLength = typeof val2 === 'number' ? 8 : length;

  return (
    <div className="option-row">
      <input type="checkbox" id={name} defaultChecked={!!val} />
      <label htmlFor={name}>{labelText}</label>
      <input type="text" id={name2} size={typedLength} defaultValue={valText} />
    </div>
  );
}

function createProperty(
  name,
  val,
  text,
  textAfter = null,
  infoText = null,
  minLength = MIN_TEXT_INPUT_LENGTH
) {
  if (typeof val === 'undefined') {
    return <></>;
  }

  const labelText = typeof text === 'string' ? text : name;

  const infoIcon = makeInfoIcon(infoText);

  if (typeof val === 'object') {
    if (typeof val?.length === 'undefined') {
      // only array objects are supported!
      console.info('Skip invalid option:', name, val, text);
      return (
        <div className="option-row red">
          Error: Corrupt option: {name}, {JSON.stringify(val)}
        </div>
      );
    }
    let length = val.length > DEFAULT_TEXTAREA_ROWS ? DEFAULT_TEXTAREA_ROWS : Math.max(3, val.length);
    if (length === val.length) {
      length++;
    }
    const valText = valOrDefault(val.join('\n'), '');
    return (
      <div className="option-col">
        <label htmlFor={name} title={infoText}>
          {labelText} {infoIcon}
        </label>
        <textarea cols={100} rows={length} id={name} defaultValue={valText} />
      </div>
    );
  }

  if (typeof val === 'boolean') {
    return (
      <>
        <div className="option-row">
          <input type="checkbox" id={name} defaultChecked={!!val} />
          <label htmlFor={name} title={infoText}>
            {labelText} {infoIcon}
          </label>
        </div>
      </>
    );
  }

  const valText = convertStringVal(val, 'error');
  const valLength = valText.length;
  const length = valLength > minLength ? valLength : minLength;
  const typedLength = typeof val === 'number' ? 8 : length;
  const labelAfter = textAfter ? <label className="labelAfter">{textAfter}</label> : <></>;
  return (
    <div className="option-row">
      <label htmlFor={name} title={infoText}>
        {labelText}:
      </label>
      <input type="text" id={name} size={typedLength} defaultValue={valText} />
      {labelAfter} {infoIcon}
    </div>
  );
}

function createPropertyCell(
  name,
  val,
  text,
  textAfter = null,
  infoText = null,
  minLength = MIN_TEXT_INPUT_LENGTH
) {
  if (typeof val === 'undefined') {
    return <></>;
  }

  const labelText = typeof text === 'string' ? text : name;

  const infoIcon = makeInfoIcon(infoText);

  if (typeof val === 'object') {
    let length = val.length > DEFAULT_TEXTAREA_ROWS ? DEFAULT_TEXTAREA_ROWS : Math.max(3, val.length);
    if (length === val.length) {
      length++;
    }
    const valText = valOrDefault(val.join('\n'), '');
    return (
      <tr>
        <td nowrap="true">
          <label htmlFor={name} title={infoText}>
            {labelText}: {infoIcon}
          </label>
        </td>
        <td nowrap="true">
          <textarea cols={100} rows={length} id={name} defaultValue={valText} />
        </td>
      </tr>
    );
  }

  const valText = convertStringVal(val, 'error');
  const valLength = valText.length;
  const length = valLength > minLength ? valLength : minLength;
  const typedLength = typeof val === 'number' ? 8 : length;
  const labelAfter = textAfter ? <label className="labelAfter">{textAfter}</label> : <></>;
  const width = typedLength * 10 + 40;
  return (
    <tr>
      <td nowrap="true">
        <label htmlFor={name} title={infoText}>
          {labelText}:
        </label>
      </td>
      <td nowrap="true">
        <input type="text" id={name} style={{ width: `${width}px` }} defaultValue={valText} />
        {labelAfter} {infoIcon}
      </td>
    </tr>
  );
}

function valOrDefault(val, defaultVal) {
  const returnVal = val === undefined || val === null ? defaultVal : val;
  return returnVal;
}

function convertStringVal(val, defaultVal) {
  const newVal = valOrDefault(val, defaultVal);
  return newVal.toString();
}

function makeInfoIcon(infoText) {
  return infoText ? <i className="bi bi-question-circle-fill info-icon" title={infoText}></i> : <></>;
}
