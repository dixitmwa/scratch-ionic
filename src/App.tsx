import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  IonSpinner,
  IonContent,
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
import './theme/theme.css';
import { ScratchProvider } from './scratch/ScratchProvider';
import { Buffer } from 'buffer';
import MainLayout from './theme/MainLayout';
import LoginPreference from './pages/Auth/LoginPreference';
import LoginMethodPreference from './pages/Auth/LoginMethodPreference';
import LoginWithCode from './pages/Auth/LoginWithCode';
import LoginWithMobile from './pages/Auth/LoginWithMobile';
import TabsLayout from './theme/TabLayout';
import CompleteProfile from './pages/Auth/CompleteProfile';
import AcceptCode from './pages/Auth/AcceptCode';
import ForgotPassword from './pages/Auth/ForgotPassword';
import { AuthProvider, useAuth } from './service/AuthService/AuthContext';
import Loader from './components/common-component/Loader';

window.Buffer = Buffer;

setupIonicReact();

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <IonApp>
        <MainLayout>
          <IonContent>
            <Loader />
          </IonContent>
        </MainLayout>
      </IonApp>
    );
  }

  return (
    <ScratchProvider>
      <IonApp>
        <MainLayout>
          <IonReactRouter>
            <IonRouterOutlet>
              {isAuthenticated ? (
                <>
                  <Route path="/tabs">
                    <TabsLayout />
                  </Route>

                  <Route>
                    <Redirect to="/tabs" />
                  </Route>
                </>
              ) : (
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

                  <Route exact path="/">
                    <Redirect to="/login" />
                  </Route>

                  <Route>
                    <Redirect to="/login" />
                  </Route>
                </>
              )}
            </IonRouterOutlet>
          </IonReactRouter>
        </MainLayout>
      </IonApp>
    </ScratchProvider>
  );
};

export default App;
