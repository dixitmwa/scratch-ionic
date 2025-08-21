import React, { useEffect, useState } from 'react';
import { Route, Redirect, RouteProps, useLocation, useHistory } from 'react-router-dom';
import { Preferences } from '@capacitor/preferences';
import { IonContent, IonPage, useIonViewDidEnter } from '@ionic/react';
import SafeAreaView from '../theme/SafeAreaView';
import MainLayout from '../theme/MainLayout';
// import { useAuth } from '../service/AuthService/AuthContext';

interface PublicRouteProps extends RouteProps {
    component: React.ComponentType<any>;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ component: Component, ...rest }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const location = useLocation();
    const history = useHistory()
    const [redirectToInitPage, setRedirectToInitPage] = useState(false);

    // const checkAuth = async () => {
    //     document.activeElement instanceof HTMLElement && document.activeElement.blur();
    //     console.log("Checking authentication status...");
    //     const { value } = await Preferences.get({ key: 'auth' });
    //     console.log("Authentication value:", value, !!value);
    //     setIsAuthenticated(!!value);
    //     const { value: initPage } = await Preferences.get({ key: 'initPage' });
    //     // if (initPage === "accept-code") {
    //     //     history.push("/accept-code")
    //     // }
    // };

    useEffect(() => {
        const checkAuth = async () => {
            document.activeElement instanceof HTMLElement && document.activeElement.blur();
            console.log("Checking authentication status...");

            const { value: authValue } = await Preferences.get({ key: 'auth' });
            const { value: initPage } = await Preferences.get({ key: 'initPage' });

            console.log("Authentication value:", authValue, !!authValue);
            setIsAuthenticated(!!authValue);

            if (initPage === "accept-code") {
                setRedirectToInitPage(true);
            }
            // await Preferences.clear()
        };

        checkAuth();
    }, []);

    useEffect(() => {
        if (redirectToInitPage) {
            history.replace("/accept-code");
        }
    }, [redirectToInitPage, history]);


    // useIonViewDidEnter(() => {
    //     checkAuth();
    // });

    if (isAuthenticated === null) {
        return null;
    }

    // if(isAuthenticated){
    //     return history.push("/tabs")
    // }
    // const { isAuthenticated } = useAuth();

    return (
        <Route
            {...rest}
            render={(props) =>
                !isAuthenticated ? <MainLayout>
                    <Component {...props} />
                </MainLayout> : <Redirect to="/tabs" />
            }
        />
    );
};

export default PublicRoute;