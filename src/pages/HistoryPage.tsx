import { IonIcon } from "@ionic/react";
import ChipCard from "../components/common-component/ChipCard";
import View from '../assets/view.svg'

const HistoryPage = () => {
    return (
        // <IonPage>
        <div style={{
            margin: "6vh 10px 10px 10px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
            maxHeight: "79vh",
            overflowY: "scroll"
        }}>
            {
                <>
                    <ChipCard textTransform={true} count={1} title="20-07-2025" rightBorder={true} icon={<IonIcon icon={View} color="primary" style={{ fontSize: '32px' }} />} />
                    <ChipCard textTransform={true} count={2} title="22-07-2025" rightBorder={true} icon={<IonIcon icon={View} color="primary" style={{ fontSize: '32px' }} />} />
                    <ChipCard textTransform={true} count={3} title="24-07-2025" rightBorder={true} icon={<IonIcon icon={View} color="primary" style={{ fontSize: '32px' }} />} />
                    <ChipCard textTransform={true} count={4} title="16-07-2025" rightBorder={true} icon={<IonIcon icon={View} color="primary" style={{ fontSize: '32px' }} />} />
                    <ChipCard textTransform={true} count={5} title="08-07-2025" rightBorder={true} icon={<IonIcon icon={View} color="primary" style={{ fontSize: '32px' }} />} />
                    <ChipCard textTransform={true} count={5} title="08-07-2025" rightBorder={true} icon={<IonIcon icon={View} color="primary" style={{ fontSize: '32px' }} />} />
                    <ChipCard textTransform={true} count={5} title="08-07-2025" rightBorder={true} icon={<IonIcon icon={View} color="primary" style={{ fontSize: '32px' }} />} />
                    <ChipCard textTransform={true} count={5} title="08-07-2025" rightBorder={true} icon={<IonIcon icon={View} color="primary" style={{ fontSize: '32px' }} />} />
                    <ChipCard textTransform={true} count={5} title="08-07-2025" rightBorder={true} icon={<IonIcon icon={View} color="primary" style={{ fontSize: '32px' }} />} />
                    <ChipCard textTransform={true} count={5} title="08-07-2025" rightBorder={true} icon={<IonIcon icon={View} color="primary" style={{ fontSize: '32px' }} />} />
                    <ChipCard textTransform={true} count={5} title="08-07-2025" rightBorder={true} icon={<IonIcon icon={View} color="primary" style={{ fontSize: '32px' }} />} />
                    <ChipCard textTransform={true} count={5} title="08-07-2025" rightBorder={true} icon={<IonIcon icon={View} color="primary" style={{ fontSize: '32px' }} />} />
                    <ChipCard textTransform={true} count={5} title="08-07-2025" rightBorder={true} icon={<IonIcon icon={View} color="primary" style={{ fontSize: '32px' }} />} />
                    <ChipCard textTransform={true} count={5} title="08-07-2025" rightBorder={true} icon={<IonIcon icon={View} color="primary" style={{ fontSize: '32px' }} />} />
                    <ChipCard textTransform={true} count={5} title="08-07-2025" rightBorder={true} icon={<IonIcon icon={View} color="primary" style={{ fontSize: '32px' }} />} />
                    <ChipCard textTransform={true} count={5} title="08-07-2025" rightBorder={true} icon={<IonIcon icon={View} color="primary" style={{ fontSize: '32px' }} />} />
                </>
            }
        </div >
        // </IonPage>
    )
}

export default HistoryPage; 