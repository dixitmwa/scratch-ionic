import { IonIcon, IonToast } from "@ionic/react";
import BackArrow from "../assets/left_arrow.svg";
import { useHistory } from "react-router";
import ChipCard from "../components/common-component/ChipCard";
import View from "../assets/view.svg";
import { useEffect, useState } from "react";
import AuthService from "../service/AuthService/AuthService";
import Loader from "../components/common-component/Loader";

const MyLibraryPage = () => {
    const history = useHistory()
    const [assignmentList, setAssignmentList] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [showMessage, setShowMessage] = useState(false)
    const [message, setMessage] = useState("")
    const [showVideo, setShowVideo] = useState(false)

    const fetchHistory = async () => {
        setIsLoading(true)
        const response = await AuthService.fetchAssignmentHistoryService()
        if (response?.status === 200) {
            setAssignmentList(response?.data?.data);
        }
        setIsLoading(false)
    }

    const handleViewDetails = () => {
        setShowVideo(true);
    }

    useEffect(() => {
        fetchHistory()

        return () => {
            setAssignmentList([])
        }
    }, [])

    return (
        isLoading ? (
            <Loader />
        ) : showVideo ? (
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
                <IonIcon icon={BackArrow} color="primary" style={{ fontSize: '32px', position: 'absolute', top: "6vh", left: 24, cursor: 'pointer', zIndex: 10000 }} onClick={() => setShowVideo(false)} />
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
        ) : (
            <div style={{
                margin: "6vh 10px 10px 10px",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                justifyContent: "center",
                maxHeight: "79vh",
                overflowY: "scroll"
            }}>
                <div style={{ width: "100%", borderBottom: "1px solid white", paddingBottom: "10px" }}>
                    <div style={{
                        padding: "0px 10px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <IonIcon icon={BackArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { history.push("/tabs/editor") }} />
                        <p style={{ color: "#29B0FF", fontSize: "20px", fontWeight: "bold", margin: "0px", textAlign: "center" }}>My Library</p>
                        <div style={{ width: "32px" }}></div>
                    </div>
                </div>
                <>
                    {
                        assignmentList.length === 0 ? (
                            <div style={{ width: "100%", textAlign: "center", color: "#607E9C", fontSize: "20px", fontWeight: "bold", marginTop: "40px" }}>
                                My library not found
                            </div>
                        ) : (
                            assignmentList.map((item: any, index) => {
                                return (
                                    <ChipCard textTransform={true} count={index + 1} title={
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            <p style={{ margin: "0px", fontWeight: 600, fontSize: "20px" }}>{item?.title}</p>
                                        </div>} icon={<IonIcon icon={View} color="primary" style={{ fontSize: '32px' }} onClick={() => { handleViewDetails() }} />} onClick={() => { handleViewDetails() }} />
                                )
                            })
                        )
                    }
                </>
                <IonToast
                    isOpen={showMessage}
                    onDidDismiss={() => setShowMessage(false)}
                    message={message}
                    duration={2000}
                />
            </div>
        )
    )
}

export default MyLibraryPage;