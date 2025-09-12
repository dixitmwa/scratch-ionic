import { IonIcon, IonSpinner, isPlatform } from "@ionic/react";
import BackArrow from "../assets/left_arrow.svg";
import { useHistory } from "react-router";
import ChipCard from "../components/common-component/ChipCard";
import RightArrow from "../assets/right_arrow.svg";
import { useEffect, useState } from "react";
import SearchInput from "../components/common-component/SearchInput";
import AssignmentService from "../service/AssignmentService/AssignmentService";
import Loader from "../components/common-component/Loader";
import { useSection } from "../context/SectionContext";
import { Preferences } from "@capacitor/preferences";

const AssignmentUpcomingPage = () => {
    const history = useHistory()
    const { setSectionId } = useSection();
    const [assignmentList, setAssignmentList] = useState([])
    const [inputValue, setInputValue] = useState("");
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const handleSearch = (val?: string) => {
        const searchVal = typeof val === 'string' ? val : inputValue;
        if (searchTimeout) clearTimeout(searchTimeout);
        const timeout = setTimeout(() => {
            fetchUpcomingAssignment(searchVal);
        }, 400);
        setSearchTimeout(timeout);
    };

    const handleViewDetails = async (item: any) => {
        await Preferences.set({ key: "backPage", value: "upcoming" })
        setSectionId(item.id);
        history.push("/tabs/assignment/details");
    }

    const fetchUpcomingAssignment = async (search: string = "") => {
        setIsLoading(true);
        const params: any = { type: "upcoming" };
        if (search && search.trim() !== "") {
            params.search = search;
        }
        const response = await AssignmentService.fetchAssignmentByTypeService(params);
        if (response?.status === 200) {
            setAssignmentList(response?.data?.data)
        }
        setIsLoading(false);
    }


    useEffect(() => {
        fetchUpcomingAssignment();
    }, [])

    useEffect(() => {
        if (inputValue === "") {
            fetchUpcomingAssignment("");
        } else {
            handleSearch(inputValue);
        }
        return () => {
            if (searchTimeout) clearTimeout(searchTimeout);
        };
    }, [inputValue]);

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
                maxHeight: isPlatform('ios') ? "79vh": "85vh",
                overflowY: "scroll"
            }}>
                <div style={{ width: "100%", borderBottom: "1px solid white", paddingBottom: "10px" }}>
                    <div style={{
                        padding: "0px 10px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <IonIcon icon={BackArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { history.push("/tabs/assignment") }} />
                        {/* <p style={{ color: "#607E9C", fontSize: "20px", fontWeight: "bold", margin: "0px", textAlign: "center" }}>Create New Assignment</p> */}
                        <SearchInput
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onSearch={() => handleSearch()}
                        />
                        <div style={{ width: "32px" }}></div>
                    </div>
                </div>
                <>
                    {
                        assignmentList.length === 0 ? (
                            <div style={{ width: "100%", textAlign: "center", color: "#607E9C", fontSize: "20px", fontWeight: "bold", marginTop: "40px" }}>
                                Assignment not found
                            </div>
                        ) : (
                            assignmentList.map((item: any, index: number) => {
                                return (
                                    <ChipCard textTransform={true} count={index + 1} title={
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            <p
                                                style={{
                                                    margin: "0px",
                                                    fontWeight: 600,
                                                    fontSize: "20px",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    maxWidth: "180px"
                                                }}
                                            >
                                                {item?.title}
                                            </p>
                                            <p style={{ margin: "0px", fontSize: "16px" }}>Class : {(item?.assignments?.[0]?.classNumber + item?.assignments?.[0]?.sectionName) || "N/A"}</p>
                                            <p style={{
                                                margin: "0px",
                                                fontSize: "16px",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                maxWidth: "180px"
                                            }}>{item?.totalStudentsAssigned}/{item?.submittedCount} students submitted</p>
                                        </div>}
                                        onClick={() => handleViewDetails(item)}
                                        icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { handleViewDetails(item) }} />} />
                                )
                            })
                        )
                    }
                </>
            </div>)
    )
}

export default AssignmentUpcomingPage;