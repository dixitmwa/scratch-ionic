import { IonIcon, useIonViewDidEnter } from "@ionic/react";
import SearchInput from "../components/common-component/SearchInput";
import { useEffect, useState, useRef } from "react";
import BackArrow from "../assets/left_arrow.svg";
import { useHistory } from "react-router";
import ChipCard from "../components/common-component/ChipCard";
import View from "../assets/view.svg"
import { useSection } from "../context/SectionContext";
import LeftArrow from "../assets/left_arrow_double.svg";
import PlayArrow from "../assets/play.svg";
import RightArrow from "../assets/right_arrow_double.svg";
import CustomButton from "../components/common-component/Button";
import Loader from "../components/common-component/Loader";
import AssignmentService from "../service/AssignmentService/AssignmentService";
import { Preferences } from "@capacitor/preferences";
import { loadProject, setLastSavedProjectData } from "../components/commonfunction";
import { attachRendererIfNone, disposeRenderer, getProjectBuffer, getVMInstance, saveCurrentProjectBuffer, setUploadedProjectBuffer } from "../scratchVMInstance";
import ScratchBlocks from 'scratch-blocks';
import '../components/blocks.css';
import { ScreenOrientation } from "@capacitor/screen-orientation";
import CommonCard from "../components/common-component/Card";

const AssignmentDetailsPage = () => {
    const { sectionId, setSelectedAssignmentItem } = useSection();
    // const blockRef = useRef(null);
    // const canvasRef = useRef(null);
    // const workspaceRef = useRef(null);
    // const vmRef = useRef(null);
    const history = useHistory();
    // const [ready, setReady] = useState(false);
    const [backPage, setBackPage] = useState<string>("");
    const [inputValue, setInputValue] = useState("");
    const [assignmentDetails, setAssignmentDetails] = useState<any>({});
    const [filteredAssignments, setFilteredAssignments] = useState<any[]>([]);
    const [showDetails, setShowDetails] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState<"correct" | "wrong" | null>(null);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    // const [fileUploaded, setFileUploaded] = useState(false);
    // const selectedSpiId = useRef(null)
    // const [selectedSpriteId, setSelectedSpriteId] = useState(null);

    const fetchAssignmentDetails = async () => {
        setIsLoading(true);
        const { value } = await Preferences.get({ key: "backPage" })
        setBackPage(value || "");
        const response = await AssignmentService.fetchAssignmentByIdService(sectionId);
        if (response?.status === 200) {
            setAssignmentDetails(response?.data?.data);
            setFilteredAssignments(response?.data?.data?.assignments || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (!assignmentDetails.assignments) return;
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            const search = inputValue.trim().toLowerCase();
            if (search === "") {
                setFilteredAssignments(assignmentDetails.assignments);
            } else {
                setFilteredAssignments(
                    assignmentDetails.assignments.filter((item: any) =>
                        item?.name?.toLowerCase().includes(search)
                    )
                );
            }
        }, 1000);
        return () => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
        };
    }, [inputValue, assignmentDetails.assignments]);

    const handleViewDetails = (item: any, idx: number) => {
        setSelectedItem(item);
        setSelectedIndex(idx);
        if (setSelectedAssignmentItem) setSelectedAssignmentItem(item);
        history.push("/tabs/assignment/project-view");
    }

    const handleAnswerClick = (answer: "correct" | "wrong") => {
        console.log(`User selected: ${answer}`);
        setSelectedAnswer(answer);
    }

    const handlePrev = () => {
        if (selectedIndex !== null) {
            let prevIndex = selectedIndex - 1;
            while (prevIndex >= 0) {
                const prevItem = assignmentDetails.assignments[prevIndex];
                if (prevItem?.isSubmitted && prevItem?.submittedDate) {
                    setSelectedIndex(prevIndex);
                    setSelectedItem(prevItem);
                    return;
                }
                prevIndex--;
            }
        }
    };

    const handleBack = async () => {
        if (backPage === "upcoming") {
            await Preferences.set({ key: "backPage", value: "" })
            history.push("/tabs/assignment/upcoming");
        } else {
            history.push("/tabs/assignment/history")
        }
    }

    const handleNext = () => {
        if (selectedIndex !== null && assignmentDetails.assignments) {
            let nextIndex = selectedIndex + 1;
            while (nextIndex < assignmentDetails.assignments.length) {
                const nextItem = assignmentDetails.assignments[nextIndex];
                if (nextItem?.isSubmitted && nextItem?.submittedDate) {
                    setSelectedIndex(nextIndex);
                    setSelectedItem(nextItem);
                    return;
                }
                nextIndex++;
            }
        }
    };

    console.log('selectedItem', selectedItem)

    useEffect(() => {
        fetchAssignmentDetails();
    }, [])

    function formatDate(dateString: string) {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    return (
        isLoading ? (
            <Loader />
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
                        <IonIcon icon={BackArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { handleBack() }} />
                        {
                            showDetails ? (
                                <div>
                                    <p style={{ color: "#607E9C", fontSize: "24px", fontWeight: "bold", marginBottom: "0px", marginTop: "0px", textAlign: "center" }}>
                                        {selectedItem?.name || ""}
                                    </p>
                                    <p style={{ color: "#607E9C", textAlign: "center", fontSize: "18px", marginBottom: "0px", marginTop: "0px" }}>
                                        {selectedItem?.mobileNumber || ""}
                                    </p>
                                </div>
                            ) : (
                                <SearchInput
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    onSearch={() => { }} // debounced, so no need to call here
                                />
                            )
                        }
                        <div style={{ width: "32px" }}></div>
                    </div>
                </div>
                <>
                    {
                        !showDetails && (
                            <>
                                {filteredAssignments.map((item: any, index: number) => (
                                    <ChipCard
                                        textTransform={true}
                                        count={index + 1}
                                        title={
                                            <div style={{ display: "flex", flexDirection: "column" }}>
                                                <p style={{ margin: "0px", fontWeight: 600, fontSize: "20px" }}>{item?.name}</p>
                                                <p
                                                    style={{
                                                        margin: "0px",
                                                        fontSize: "16px",
                                                        color: item?.submittedDate ? "#607E9C" : "#FF297A"
                                                    }}
                                                >
                                                    {item?.submittedDate ? `Submitted date : ${formatDate(item?.submittedDate)}` : "Not Submitted"}
                                                </p>
                                            </div>
                                        }
                                        icon={
                                            <IonIcon
                                                icon={View}
                                                color="primary"
                                                style={{ fontSize: '32px' }}
                                                onClick={() => { handleViewDetails(item, index) }}
                                            />
                                        }
                                        onClick={() => { item?.submittedDate ? handleViewDetails(item, index) : null }}
                                    />

                                ))}
                                {filteredAssignments.length === 0 && (
                                    <div style={{ width: '100%', textAlign: 'center', color: '#607E9C', marginTop: '32px', fontSize: '20px', fontWeight: 500 }}>
                                        No assignments found
                                    </div>
                                )}
                            </>
                        )
                    }
                </>
            </div>)
    );
};

export default AssignmentDetailsPage;
