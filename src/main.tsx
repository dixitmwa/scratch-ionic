import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import "./css/base.css"
import { isPlatform } from '@ionic/react';
import { setupIonicReact } from '@ionic/react';

const mode = isPlatform('ios') ? 'ios' : 'md';
setupIonicReact({
  mode,
  swipeBackEnabled: true
});

defineCustomElements(window);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);