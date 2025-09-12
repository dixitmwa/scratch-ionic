import { Redirect, Route } from 'react-router-dom';
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

import './theme/variables.css';
import { ScratchProvider } from './scratch/ScratchProvider';
import { Buffer } from 'buffer';
import TabsLayout from './theme/TabLayout';
import LoginPreference from './pages/Auth/LoginPreference';
import LoginMethodPreference from './pages/Auth/LoginMethodPreference';
import LoginWithMobile from './pages/Auth/LoginWithMobile';
import LoginWithCode from './pages/Auth/LoginWithCode';
import CompleteProfile from './pages/Auth/CompleteProfile';
import AcceptCode from './pages/Auth/AcceptCode';
import ForgotPassword from './pages/Auth/ForgotPassword';
import { useAuth } from './service/AuthService/AuthContext';

window.Buffer = Buffer;

setupIonicReact();

const AppV1: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <ScratchProvider>
      <IonApp>
        <IonReactRouter>
          <IonRouterOutlet>
            {isAuthenticated ? (
              // Private Routes - Only render when authenticated
              <>
                <Route path="/tabs">
                  <TabsLayout />
                </Route>
                
                {/* Redirect all other routes to tabs when authenticated */}
                <Route>
                  <Redirect to="/tabs" />
                </Route>
              </>
            ) : (
              // Public Routes - Only render when not authenticated
              <>
                <Route exact path="/login">
                  <LoginPreference />
                </Route>
                
                <Route exact path="/login-method">
                  <LoginMethodPreference />
                </Route>
                
                <Route exact path="/sign-in">
                  <LoginWithMobile />
                </Route>
                
                <Route exact path="/sign-up">
                  <LoginWithCode />
                </Route>
                
                <Route exact path="/complete-profile">
                  <CompleteProfile />
                </Route>
                
                <Route exact path="/accept-code">
                  <AcceptCode />
                </Route>
                
                <Route exact path="/forgot-password">
                  <ForgotPassword />
                </Route>

                {/* Default redirect to login when not authenticated */}
                <Route exact path="/">
                  <Redirect to="/login" />
                </Route>
                
                {/* Redirect all other routes to login when not authenticated */}
                <Route>
                  <Redirect to="/login" />
                </Route>
              </>
            )}
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    </ScratchProvider>
  );
};

export default AppV1;