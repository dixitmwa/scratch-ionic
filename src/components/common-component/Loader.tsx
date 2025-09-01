import { IonSpinner } from "@ionic/react";

const Loader = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', width: '100%' }}>
            <IonSpinner name="dots" color="primary" style={{ height: '100px', width: "100px" }} />
        </div>
    )
}

export default Loader;