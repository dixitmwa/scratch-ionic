import { IonIcon } from "@ionic/react";
import BackArrow from "../assets/left_arrow.svg";
import { useHistory } from "react-router";
import { useSection } from "../context/SectionContext";

const AssignmentBlockVideoPage = () => {
     const { selectedAssignmentItem } = useSection();
    const history = useHistory();

    const handleBackToPrevious = () => {
        history.push("/tabs/assignment/project-view")
    }

    console.log('selectedAssignmentItem', selectedAssignmentItem)

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "#fff",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "6vh 10px 10px 10px",
            justifyContent: "center"
        }}>
            <IonIcon icon={BackArrow} color="primary" style={{ fontSize: '32px', position: 'absolute', top: "6vh", left: 24, cursor: 'pointer', zIndex: 10000 }} onClick={() => handleBackToPrevious()} />
            <div style={{
                width: "100vw",
                maxWidth: "100vw",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <video
                    controls
                    autoPlay
                    style={{
                        width: "90vw",
                        maxWidth: "90vw",
                        aspectRatio: "16/9",
                        background: "#fff",
                        borderRadius: "12px"
                    }}
                    poster="https://www.youtube.com/watch?v=O5O3yK8DJCc&ab_channel=Sony%7CCameraChannel"
                >
                    <source src="https://www.youtube.com/watch?v=O5O3yK8DJCc&ab_channel=Sony%7CCameraChannel" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    )
}

export default AssignmentBlockVideoPage;