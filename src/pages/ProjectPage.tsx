import { IonIcon } from "@ionic/react";
import ChipCard from "../components/common-component/ChipCard";
// import { eyeOutline } from "ionicons/icons";
import View from '../assets/view.svg'
import RightArrow from '../assets/right_arrow.svg'
import { useHistory } from "react-router";
import { useSection } from "../context/SectionContext";
import ClassRoomService from "../service/ClassroomService/ClassRoomService";
import { useEffect, useState } from "react";

const ProjectPage = () => {
    const history = useHistory();
    const [projects, setProjects] = useState<any[]>([]);
    console.log("projects", projects)
    const fetchProjects = async () => {
        const response = await ClassRoomService.fetchLoggedStudentProjectsService();
        if (response?.status === 200) {
            console.log("response", response?.data?.data)
            setProjects(response?.data?.data || []);
        }
    }

    const { setProjectId } = useSection();
    const navigateToDetailsPage = (projectId: string) => {
        setProjectId(String(projectId));
        history.push(`/tabs/project/details`)
    }

    useEffect(() => {
        fetchProjects();
    }, [])

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
                    {
                        projects.map((project, index) => {

                            return (
                                <ChipCard textTransform={true} count={index + 1} title={
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <p style={{
                                            margin: "0px",
                                            fontWeight: 600,
                                            fontSize: "20px",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            maxWidth: "200px"
                                        }}>{project.title || "-"}</p>
                                        {(() => {
                                            const now = new Date();
                                            const endDate = project.endDate ? new Date(project.endDate) : null;
                                            if (endDate && now < endDate && !project.isSubmitted) {
                                                // Upcoming deadline, not submitted
                                                return (
                                                    <p style={{ margin: "0px", fontSize: "14px", color: "#607E9C" }}>
                                                        Last date : {endDate.toLocaleDateString("en-GB")}
                                                    </p>
                                                );
                                            } else if (project.isSubmitted) {
                                                // Submitted (before or after deadline)
                                                return (
                                                    <p style={{ margin: "0px", fontSize: "16px", color: "#29B0FF", fontWeight: 600 }}>
                                                        Submitted
                                                    </p>
                                                );
                                            } else if (endDate && now > endDate && !project.isSubmitted) {
                                                // Deadline crossed, not submitted
                                                return (
                                                    <p style={{ margin: "0px", fontSize: "16px", color: "#FF3B30", fontWeight: 600 }}>
                                                        Not submitted
                                                    </p>
                                                );
                                            } else {
                                                // Fallback
                                                return null;
                                            }
                                        })()}
                                    </div>} icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { navigateToDetailsPage(project.id) }} />} />
                            )
                        })
                    }
                    {/* <ChipCard textTransform={true} count={2}
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
                        } icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { navigateToDetailsPage("5") }} />} /> */}
                </>
            }
        </div >
        // </IonPage>
    )
}

export default ProjectPage;