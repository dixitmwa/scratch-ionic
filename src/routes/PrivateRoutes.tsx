// import React from 'react';
// import { Route, Redirect, RouteProps } from 'react-router-dom';
// import { Preferences } from '@capacitor/preferences';
// import { IonPage } from '@ionic/react';
// import SafeAreaView from '../theme/SafeAreaView';

// interface PrivateRouteProps extends RouteProps {
//   component: React.ComponentType<any>;
// }

// const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, ...rest }) => {
//   const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null | string>("wefwergwebvfhbswd serkguikergh ");

//   React.useEffect(() => {
//     const checkAuth = async () => {
//       const { value } = await Preferences.get({ key: 'auth' });
//       setIsAuthenticated(!!value);
//     };
//     checkAuth();
//   }, []);

//   if (isAuthenticated === null) {
//     return null;
//   }

//   return (
//     <Route
//       {...rest}
//       render={(props) =>
//         isAuthenticated ? (
//           <IonPage>
//             <SafeAreaView>
//               <Component {...props} />
//             </SafeAreaView>
//           </IonPage>
//         ) : (
//           <IonPage>
//             <SafeAreaView>
//               <Redirect to="/" />
//             </SafeAreaView>
//           </IonPage>
//         )
//       }
//     />
//   );
// };

// export default PrivateRoute;

// auth/PrivateRoute.tsx
import React from "react";
import { Route, Redirect } from "react-router-dom";
import { Preferences } from "@capacitor/preferences";

interface PrivateRouteProps {
  component: React.ComponentType<any>;
  path: string;
  exact?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, ...rest }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null | string>();

  React.useEffect(() => {
    const checkAuth = async () => {
      const { value } = await Preferences.get({ key: 'auth' });
      setIsAuthenticated(!!value);
    };
    checkAuth();
  }, []);

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
};

export default PrivateRoute;
