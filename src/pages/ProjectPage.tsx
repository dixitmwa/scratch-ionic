import { IonIcon } from "@ionic/react";
import ChipCard from "../components/common-component/ChipCard";
// import { eyeOutline } from "ionicons/icons";
import View from '../assets/view.svg'
import RightArrow from '../assets/right_arrow.svg'
import { useHistory } from "react-router";

const ProjectPage = () => {
    const history = useHistory();

    const navigateToDetailsPage = (projectId: string) => {
        history.push(`/tabs/project/details`)
    }

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
                    <ChipCard textTransform={true} count={1} title={
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <p style={{ margin: "0px", fontWeight: 600, fontSize: "20px" }}>Animal</p>
                            <p style={{ margin: "0px", fontSize: "16px" }}>20-aug</p>
                        </div>} icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { navigateToDetailsPage("1") }} />} />
                    <ChipCard textTransform={true} count={2}
                        title={
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <p style={{ margin: "0px", fontWeight: 600, fontSize: "20px" }}>Environment</p>
                                <p style={{ margin: "0px", fontSize: "16px" }}>20-aug</p>
                            </div>
                        } icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { navigateToDetailsPage("2") }} />} />
                    <ChipCard textTransform={true} count={3}
                        title={
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <p style={{ margin: "0px", fontWeight: 600, fontSize: "20px" }}>Country</p>
                                <p style={{ margin: "0px", fontSize: "16px" }}>20-aug</p>
                            </div>
                        } icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { navigateToDetailsPage("3") }} />} />
                    <ChipCard textTransform={true} count={4}
                        title={
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <p style={{ margin: "0px", fontWeight: 600, fontSize: "20px" }}>Game</p>
                                <p style={{ margin: "0px", fontSize: "16px" }}>20-aug</p>
                            </div>
                        } icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { navigateToDetailsPage("4") }} />} />
                    <ChipCard textTransform={true} count={5}
                        title={
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <p style={{ margin: "0px", fontWeight: 600, fontSize: "20px" }}>Computer</p>
                                <p style={{ margin: "0px", fontSize: "16px" }}>20-aug</p>
                            </div>
                        } icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { navigateToDetailsPage("5") }}/>} />
                </>
            }
        </div >
        // </IonPage>
    )
}

export default ProjectPage;