import { IonIcon } from "@ionic/react";
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

const AssignmentDetailsPage = () => {
    const { sectionId } = useSection();
    const history = useHistory();
    const [inputValue, setInputValue] = useState("");
    const [assignmentDetails, setAssignmentDetails] = useState<any>({});
    const [filteredAssignments, setFilteredAssignments] = useState<any[]>([]);
    const [showDetails, setShowDetails] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAnswer, setSelectedAnswer] = useState<"correct" | "wrong" | null>(null);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    const fetchAssignmentDetails = async () => {
        setIsLoading(true);
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
        setShowDetails(true);
    }

    const handleAnswerClick = (answer: "correct" | "wrong") => {
        console.log(`User selected: ${answer}`);
        setSelectedAnswer(answer);
    }

    const handlePrev = () => {
        debugger
        if (selectedIndex !== null && selectedIndex > 0) {
            const prevIndex = selectedIndex - 1;
            setSelectedIndex(prevIndex);
            setSelectedItem(assignmentDetails.assignments[prevIndex]);
        }
    };

    const handleNext = () => {
        if (
            selectedIndex !== null &&
            assignmentDetails.assignments &&
            selectedIndex < assignmentDetails.assignments.length - 1
        ) {
            const nextIndex = selectedIndex + 1;
            setSelectedIndex(nextIndex);
            setSelectedItem(assignmentDetails.assignments[nextIndex]);
        }
    };

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
                        <IonIcon icon={BackArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { showDetails ? setShowDetails(false) : history.push("/tabs/assignment/history") }} />
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
                                    onSearch={() => {}} // debounced, so no need to call here
                                />
                            )
                        }
                        <div style={{ width: "32px" }}></div>
                    </div>
                </div>
                <>
                    {
                        !showDetails ? (
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
                                        onClick={() => { handleViewDetails(item, index) }}
                                    />

                                ))}
                                {filteredAssignments.length === 0 && (
                                    <div style={{ width: '100%', textAlign: 'center', color: '#607E9C', marginTop: '32px', fontSize: '20px', fontWeight: 500 }}>
                                        No assignments found
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{
                                background: '#F7FAFF',
                                borderRadius: '20px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                padding: '24px 12px 16px 12px',
                                width: '100%',
                                margin: '0 auto',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}>
                                <CustomButton btnText="" icon={<IonIcon icon={LeftArrow} style={{ fontSize: "25px" }} />} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', width: "60px" }} onClick={handlePrev} />
                                <CustomButton btnText="" icon={<IonIcon icon={RightArrow} style={{ fontSize: "25px" }} />} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', width: "60px" }} onClick={handleNext} />
                                <div style={{
                                    background: '#fff',
                                    borderRadius: '16px',
                                    padding: '18px 8px',
                                    minHeight: '400px',
                                    minWidth: '330px',
                                    marginBottom: '18px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                                }}>
                                    blocks
                                </div>
                                <CustomButton btnText="" style={{ width: "auto" }}
                                    icon={<IonIcon icon={PlayArrow} style={{ fontSize: "25px" }} />}
                                />
                                <div style={{ display: 'flex', gap: "5px", justifyContent: 'space-between', marginTop: '8px' }}>
                                    <CustomButton
                                        btnText="wrong"
                                        txtColor={selectedAnswer === "wrong" ? "#FFFFFF" :
                                            "#607E9C"}
                                        background={selectedAnswer === "wrong" ? "#FF297A" : "#FFFFFF"}
                                        style={{
                                            padding: '12px 20px',
                                        }}
                                        onClick={() => { handleAnswerClick("wrong") }}
                                    />
                                    <CustomButton
                                        btnText="correct"
                                        txtColor={selectedAnswer === "correct" ? "#FFFFFF" : "#607E9C"}
                                        background={selectedAnswer === "correct" ? "#29B0FF" : "#FFFFFF"}
                                        style={{
                                            padding: '12px 20px',
                                        }}
                                        onClick={() => { handleAnswerClick("correct") }}
                                    />
                                </div>
                            </div>
                        )
                    }
                </>
            </div>)
    );
};

export default AssignmentDetailsPage;
