import React from 'react';
import Button from 'react-bootstrap/Button';
import './popup.scss';
import config from './config.js';

export default function App() {
  return (
    <>
      <div className="popup">
        {config.map((item, index) => (
          <MenuItem key={index} item={item} />
        ))}
      </div>
    </>
  );
}

function MenuItem({ item }) {
  console.log(item);
  return (
    <>
      <Button variant="primary" onClick={item.callback}>
        {item.text}
      </Button>
    </>
  );
}
