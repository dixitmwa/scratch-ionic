import { IonIcon } from "@ionic/react";
import ChipCard from "../components/common-component/ChipCard";
// import { eyeOutline } from "ionicons/icons";
import View from '../assets/view.svg'
import RightArrow from '../assets/right_arrow.svg'
import { useHistory } from "react-router";
import { useSection } from "../context/SectionContext";
import ClassRoomService from "../service/ClassroomService/ClassRoomService";
import { useEffect, useState } from "react";
import Loader from "../components/common-component/Loader";

const ProjectPage = () => {
    const history = useHistory();
    const [projects, setProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    console.log("projects", projects)
    const fetchProjects = async () => {
        setIsLoading(true);
        const response = await ClassRoomService.fetchLoggedStudentProjectsService();
        if (response?.status === 200) {
            setProjects(response?.data?.data || []);
        }
        setIsLoading(false);
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
        isLoading ? (<Loader />) : (
            // <IonPage>
            < div style={{
                margin: "6vh 10px 10px 10px",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                justifyContent: "center",
                maxHeight: "79vh",
                overflowY: "scroll"
            }
            }>
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
                                                    return (
                                                        <p style={{ margin: "0px", fontSize: "14px", color: "#607E9C" }}>
                                                            Last date : {endDate.toLocaleDateString("en-GB")}
                                                        </p>
                                                    );
                                                } else if (project.isSubmitted) {
                                                    return (
                                                        <p style={{ margin: "0px", fontSize: "16px", color: "#29B0FF", fontWeight: 600 }}>
                                                            Submitted
                                                        </p>
                                                    );
                                                } else if (endDate && now > endDate && !project.isSubmitted) {
                                                    return (
                                                        <p style={{ margin: "0px", fontSize: "16px", color: "#FF297A", fontWeight: 600 }}>
                                                            Not submitted
                                                        </p>
                                                    );
                                                } else {
                                                    return null;
                                                }
                                            })()}
                                        </div>} icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { navigateToDetailsPage(project.id) }} />} />
                                )
                            })
                        }
                        {
                            projects.length === 0 && (
                                <div style={{ width: "100%", textAlign: "center", color: "#607E9C", fontSize: "20px", fontWeight: "bold", marginTop: "40px" }}>
                                    No projects found
                                </div>
                            )
                        }
                    </>
                }
            </div >
            // </IonPage>
        )
    )
}

export default ProjectPage;