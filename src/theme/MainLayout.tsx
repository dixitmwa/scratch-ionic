import { IonPage } from "@ionic/react";
import "./theme.css";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <IonPage>
            <div className="main-layout">
                <div className="main-content">{children}</div>
                {/* <div className="bottom-strap" /> */}
            </div>
        </IonPage>
    )
}

export default MainLayout;