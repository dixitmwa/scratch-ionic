import { IonIcon } from "@ionic/react";
import Loader from "../components/common-component/Loader";
import ChipCard from "../components/common-component/ChipCard";
import View from '../assets/view.svg'
import { useEffect, useState } from "react";
import AuthService from "../service/AuthService/AuthService";
import BackArrow from "../assets/left_arrow.svg";

const HistoryPage = () => {
    const [assignmentList, setAssignmentList] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [showVideo, setShowVideo] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

    const fetchHistory = async () => {
        setIsLoading(true)
        const response = await AuthService.fetchAssignmentHistoryService()
        if (response?.status === 200) {
            setAssignmentList(response?.data?.data);
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchHistory()

        return () => {
            setAssignmentList([])
        }
    }, [])

    return (
        <>
            {isLoading ? (
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
                    justifyContent: "center",
                    overflowY: "scroll",
                    overflowX: "hidden"
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
                            <source src={selectedVideo || "https://www.youtube.com/watch?v=O5O3yK8DJCc&ab_channel=Sony%7CCameraChannel"} type="video/mp4" />
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
                    {
                        assignmentList.length === 0 ? (
                            <div style={{ width: "100%", textAlign: "center", color: "#607E9C", fontSize: "20px", fontWeight: "bold", marginTop: "40px" }}>
                                History not found
                            </div>
                        ) : (
                            assignmentList.map((item: any, index) => {
                                return (
                                    <ChipCard
                                        textTransform={true}
                                        count={index + 1}
                                        title={item.title}
                                        // rightBorder={true}
                                        icon={<IonIcon icon={View} color="primary" style={{ fontSize: '32px' }} />}
                                        onClick={() => {
                                            setSelectedVideo(item.videoUrl || "https://www.youtube.com/watch?v=O5O3yK8DJCc&ab_channel=Sony%7CCameraChannel");
                                            setShowVideo(true);
                                        }}
                                    />
                                )
                            })
                        )
                    }
                </div>
            )}
        </>
    )
}

export default HistoryPage;