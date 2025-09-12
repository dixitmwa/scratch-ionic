import React from 'react';
import ReactDOM from 'react-dom';
import { SectionProvider } from './context/SectionContext';
import { AuthProvider } from './service/AuthService/AuthContext';
import App from './App'; // Updated App component with authentication and theming
// import AppV1 from './AppV1'; // Alternative App component
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

/* Old implementation without authentication:
function Main() {
  return (
    <React.StrictMode>
      <SectionProvider>
        <App />
      </SectionProvider>
    </React.StrictMode>
  );
}
*/

// New implementation with authentication and theming
function Main() {
  return (
    <React.StrictMode>
      <AuthProvider>
        <SectionProvider>
          <App />
        </SectionProvider>
      </AuthProvider>
    </React.StrictMode>
  );
}

ReactDOM.render(<Main />, document.getElementById('root'));