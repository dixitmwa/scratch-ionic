import { Redirect, Route, BrowserRouter as Router } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
// import '@ionic/react/css/palettes/dark.system.css';

import './theme/variables.css';
import { ScratchProvider } from './scratch/ScratchProvider';
import { Buffer } from 'buffer';
import MainLayout from './theme/MainLayout';
import LoginPreference from './pages/Auth/LoginPreference';
import LoginMethodPreference from './pages/Auth/LoginMethodPreference';
import LoginWithCode from './pages/Auth/LoginWithCode';
import LoginWithMobile from './pages/Auth/LoginWithMobile';
import TabsLayout from './theme/TabLayout';
import ScratchWorkspace from './components/ScratchWorkspace';
import PrivateRoute from './routes/PrivateRoutes';
import PublicRoute from './routes/PublicRoutes';
import CompleteProfile from './pages/Auth/CompleteProfile';
import AcceptCode from './pages/Auth/AcceptCode';
import ForgotPassword from './pages/Auth/ForgotPassword';
window.Buffer = Buffer;

setupIonicReact();

const App: React.FC = () => (
  <ScratchProvider>
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <PublicRoute exact path="/" component={LoginPreference} />
          <PublicRoute exact path="/login" component={LoginPreference} />
          <PublicRoute exact path="/login-method" component={LoginMethodPreference} />
          <PublicRoute exact path="/sign-in" component={LoginWithMobile} />
          <PublicRoute exact path="/sign-up" component={LoginWithCode} />
          <PublicRoute exact path="/complete-profile" component={CompleteProfile} />
          <PublicRoute exact path="/accept-code" component={AcceptCode} />
          <PublicRoute exact path="/forgot-password" component={ForgotPassword} />

          <Route exact path="/scratch-editor" render={() => (
            <MainLayout>
              <ScratchWorkspace />
            </MainLayout>
          )} />

          <PrivateRoute path="/tabs" component={TabsLayout} />

          {/* <Route path="/tabs" component={TabsLayout} /> */}
          <Route render={() => <Redirect to="/" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  </ScratchProvider>
);

export default App;
