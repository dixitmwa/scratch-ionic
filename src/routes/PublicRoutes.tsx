import React, { useEffect, useState } from 'react';
import { Route, Redirect, RouteProps, useLocation } from 'react-router-dom';
import { Preferences } from '@capacitor/preferences';
import { IonContent, IonPage, useIonViewDidEnter } from '@ionic/react';
import SafeAreaView from '../theme/SafeAreaView';
import MainLayout from '../theme/MainLayout';

interface PublicRouteProps extends RouteProps {
    component: React.ComponentType<any>;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ component: Component, ...rest }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const location = useLocation();

    const checkAuth = async () => {
        document.activeElement instanceof HTMLElement && document.activeElement.blur();
        console.log("Checking authentication status...");
        const { value } = await Preferences.get({ key: 'auth' });
        console.log("Authentication value:", value);
        setIsAuthenticated(!!value);
    };

    console.log("isAuthenticated:", isAuthenticated)

    useEffect(() => {
        checkAuth();
    }, [location]);

    useIonViewDidEnter(() => {
        checkAuth();
    });

    if (isAuthenticated === null) {
        return null;
    }

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