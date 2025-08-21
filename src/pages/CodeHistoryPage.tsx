import { IonIcon } from "@ionic/react"
import BackArrow from "../assets/left_arrow.svg"
import { useHistory } from "react-router"
import ChipCard from "../components/common-component/ChipCard"
import View from '../assets/view.svg'

const CodeHistoryPage = () => {
    const history = useHistory()

    return (
        <div className="project-details-content" style={{
            margin: "6vh 0px 10px 0px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
            maxHeight: "79vh",
            // overflowY: "scroll",
        }}>
            <div className="header" style={{ width: "100%", borderBottom: "1px solid white", paddingBottom: "10px" }}>
                <div style={{
                    padding: "0px 10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <IonIcon icon={BackArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { history.push("/tabs/profile") }} />
                    <div>
                        <p style={{
                            fontSize: "24px",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            color: "#607E9C",
                            textAlign: "center",
                            marginTop: "0px",
                            marginBottom: "0px"
                        }}>
                            Code History
                        </p>
                    </div>
                    <div style={{ width: "32px" }}></div>
                </div>
            </div>

            <div style={{
                margin: "0px 10px 10px 10px",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                justifyContent: "center",
                // height: "72vh",
                maxHeight: "72vh",
                maxWidth: "366px",
                // width: "100%",
                overflowY: "scroll",
            }}>
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
                </>
            </div>
        </div>
    )
}

export default CodeHistoryPage;