import { IonIcon } from "@ionic/react";
import { chevronBackOutline } from "ionicons/icons";
const CommonModal = ({
    description,
    title,
    onClick
}: { description: string, title: string, onClick: () => void }) => {
    return (
        <div style={{
            background: "#FFF",
            boxShadow: "0 2px 2px 0 rgba(0, 0, 0, 0.15)",
            borderRadius: "20px",
            padding: "10px 15px",
            maxWidth: "335px",
            width: "100%",
            gap: "20px",
            height: "70vh",
            color: "#607E9C"
        }}>
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "relative",
            }}>
                <div style={{ position: "absolute", left: 0 }}>
                    <IonIcon icon={chevronBackOutline} style={{ fontSize: '32px' }} onClick={onClick} />
                </div>
                {/* <IonIcon icon={chevronBackOutline} style={{ fontSize: '32px' }} onClick={onClick} /> */}
                <p style={{
                    margin: "0 auto",
                    fontSize: "24px",
                    textAlign: "center",
                    fontWeight: 600,
                    marginTop: "0.7em",
                    marginBottom: "0.7em"
                }}>{title}</p>
            </div>
            <div style={{
                border: "1px solid #607E9C",
                width: "100%",
                height: "1px"
            }}></div>
            <div>
                <p style={{
                    fontSize: "18px",
                }}>{description}</p>
            </div>
        </div>
    )
}

export default CommonModal;