import { IonDatetime, IonIcon, IonToast } from "@ionic/react";
import SearchInput from "../components/common-component/SearchInput";
import { useEffect, useState, useRef } from "react";
import BackArrow from "../assets/left_arrow.svg";
import { useHistory } from "react-router";
import ChipCard from "../components/common-component/ChipCard";
import View from "../assets/view.svg"
import EditButton from "../assets/edit_button.svg"
import { useSection } from "../context/SectionContext";
import Loader from "../components/common-component/Loader";
import AssignmentService from "../service/AssignmentService/AssignmentService";
import { Preferences } from "@capacitor/preferences";
import '../components/blocks.css';
import CustomButton from "../components/common-component/Button";
import CustomDropdown from "../components/common-component/DropDown";
import CommonInput from "../components/common-component/Input";
import CommonPopup from "../components/common-component/Popup";
import BackArrowWhite from "../assets/left_arrow_white.svg"
import CommonCard from "../components/common-component/Card";
import Radio from "../assets/radio.svg"
import Plus from "../assets/plus.svg"
import CodeLinkService from "../service/CodeLinkService/CodeLinkService";

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
    const [isEdit, setIsEdit] = useState(false);
    const [editAssignment, setEditAssignment] = useState<any>(null);
    const [editForm, setEditForm] = useState({
        assignmentName: "",
        description: "",
        date: ""
    });
    const [showEditToast, setShowEditToast] = useState(false);
    const [editToastMsg, setEditToastMsg] = useState("");
    const [selectedClass, setSelectedClass] = useState(true)
    // Fix ref type for IonModal
    const selectStudentModalRef = useRef<HTMLIonModalElement>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [classDivisionData, setClassDivisionData] = useState<any[]>([]);
    const [studentList, setStudentList] = useState<any[]>([]);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isModalDateOpen, setIsModalDateOpen] = useState(false);
    const [classDetails, setClassDetails] = useState({
        class: "",
        division: "",
        assignmentName: "",
        className: "",
        description: "",
        date: "",
    })
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [selectedOptions, setSelectedOptions] = useState({ class: "", division: "" });

    // Map classOptions using classId for value, classNumber for label
    const classOptions = classDivisionData.map(item => ({
        label: item.classNumber,
        value: item.classId
    }));

    // Find selected class object by classId
    const selectedClassObj = classDivisionData.find(item => item.classId === classDetails.class);
    const divisionOptionsRaw = selectedClassObj?.sections || [];

    // Map divisionOptions using sectionId for value, sectionName for label
    const divisionOptions = divisionOptionsRaw.map((section: any) => ({
        label: section.sectionName,
        value: section.sectionId
    }));
    // When editAssignment changes, pre-fill form
    useEffect(() => {
        if (editAssignment) {
            setEditForm({
                assignmentName: editAssignment.title || "",
                description: editAssignment.description || "",
                date: editAssignment.endDate || ""
            });
        }
    }, [editAssignment]);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

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
            let filtered = [];
            if (search === "") {
                filtered = assignmentDetails.assignments;
            } else {
                filtered = assignmentDetails.assignments.filter((item: any) =>
                    item?.name?.toLowerCase().includes(search)
                );
            }
            setFilteredAssignments(filtered);
            // // Set selected students from studentId field of first assignment in filteredAssignments
            // if (filtered.length > 0 && Array.isArray(filtered[0].studentId)) {
            //     setSelected(filtered[0].studentId);
            // } else {
            //     setSelected([]);
            // }
        }, 1000);
        return () => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
        };
    }, [inputValue, assignmentDetails.assignments]);

    const handleViewDetails = (item: any, idx: number) => {
        setSelectedItem(item);
        setSelectedIndex(idx);
        if (setSelectedAssignmentItem) setSelectedAssignmentItem(item);
        // if (setProjectId) setProjectId(item.id);
        history.push("/tabs/assignment/project-view");
    }

    const handleEditAssignment = () => {
        const item = assignmentDetails;
        setEditAssignment(item);
        setClassDetails({
            class: item.classId || "",
            division: item.sectionId || "",
            assignmentName: item.title || "",
            className: item.className || "",
            description: item.description || "",
            date: item.endDate || "",
        });
        // Set selected students to all studentId values from assignments array
        debugger
        if (Array.isArray(item.assignments)) {
            const studentIds = item.assignments.map((a: any) => a.studentId).filter((id: any) => id !== undefined && id !== null);
            setSelected(studentIds);
        } else {
            setSelected([]);
        }
        setSelectedClass(item?.projectType === "Student" ? false : true)
        setIsEdit(true);
    }

    const handleScheduleAssignment = async () => {
        try {
            setIsSubmitting(true);
            const reqObj = {
                classId: classDetails.class,
                sectionId: classDetails.division,
                title: classDetails.assignmentName,
                description: classDetails.description,
                endDate: classDetails.date,
                projectType: selectedClass ? "Class" : "Student",
                className: !selectedClass ? classDetails.className : undefined,
                studentIds: !selectedClass ? Array.from(new Set(selected)) : undefined,
                projectId: assignmentDetails.id
            };
            const response = await AssignmentService.updateAssignmentService(reqObj);
            if (response?.status === 200) {
                setEditToastMsg(response?.data?.message);
                setShowEditToast(true);
                // Update selected students to latest after scheduling
                if (!selectedClass && reqObj.studentIds) {
                    setSelected(reqObj.studentIds);
                }
            }
        } catch (error) {
            console.error("Error scheduling assignment:", error);
        } finally {
            setIsSubmitting(false);
        }
    }

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

    const fetchClassAndDiv = async () => {
        debugger
        const response = await CodeLinkService.fetchClassAndDivisionService()
        if (response?.status === 200) {
            setClassDivisionData(response?.data?.data);
        }
    }

    const fetchStudentByDivision = async () => {
        debugger
        if (assignmentDetails.classId && assignmentDetails.sectionId) {
            const response = await CodeLinkService.fetchStudentsByDivisionService({ classId: selectedOptions.class, sectionId: selectedOptions.division })
            if (response?.status === 200) {
                debugger
                setStudentList(response?.data?.data)
                console.log("response", response)
            }
        }
    }

    const handleCloseModal = () => {
        selectStudentModalRef.current?.dismiss && selectStudentModalRef.current.dismiss();
    }

    const toggleSelect = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    console.log('selectedItem', selectedItem)

    useEffect(() => {
        if (isEdit) { fetchStudentByDivision(); }
        else {
            fetchAssignmentDetails();
            fetchClassAndDiv();
        }
    }, [isEdit])

    function formatDate(dateString: string) {
        if (!dateString) return "";
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    console.log('classDetails', classDetails, divisionOptions, studentList)

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
                        <IonIcon icon={BackArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { isEdit ? setIsEdit(false) : handleBack() }} />
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
                                !isEdit && (
                                    <>
                                        <SearchInput
                                            value={inputValue}
                                            onChange={e => setInputValue(e.target.value)}
                                            onSearch={() => { }} // debounced, so no need to call here
                                        />
                                        <IonIcon icon={EditButton} color="#D929FF" style={{ fontSize: '38px' }} onClick={() => { handleEditAssignment() }} />
                                    </>
                                )
                            )
                        }
                        {/* <div style={{ width: "32px" }}></div> */}
                    </div>
                </div>
                <>
                    {
                        !showDetails && (
                            <>
                                {!isEdit && filteredAssignments.map((item: any, index: number) => (
                                    // <div style={{ display: "flex", alignItems: "center" }} key={item.id || index}>
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
                                    // </div>
                                ))}
                                {/* Inline Edit Form Modal */}
                                {isEdit && (
                                    <>
                                        <div>
                                            <div style={{ display: "flex", gap: "10px", margin: "10px 0px" }}>
                                                <CustomButton icon={<IonIcon icon={Radio} />} btnText="Class" background={selectedClass ? "#29B0FF" : "#FFFFFF"} txtColor={selectedClass ? "white" : "#607E9C"} style={{ fontSize: "18px", textTransform: "capitalize", ...(!selectedClass && { border: "1px solid #607E9C" }) }} disable={true} />
                                                <CustomButton icon={<IonIcon icon={Radio} />} btnText="Students" background={!selectedClass ? "#29B0FF" : "#FFFFFF"} txtColor={!selectedClass ? "white" : "#607E9C"} style={{ fontSize: "18px", textTransform: "capitalize", ...(selectedClass && { border: "1px solid #607E9C" }) }} disable={true} />
                                            </div>
                                            <div style={{
                                                border: "1px solid #607E9C",
                                                width: "100%",
                                                height: "1px"
                                            }}></div>

                                            <div style={{ display: "flex", gap: "10px", margin: "10px 0px" }}>
                                                <CustomDropdown
                                                    placeholder="Class"
                                                    value={classDetails.class}
                                                    options={classOptions}
                                                    onChange={() => { }}
                                                    disabled={true}
                                                />
                                                <CustomDropdown
                                                    placeholder="Division"
                                                    value={classDetails.division}
                                                    options={divisionOptions}
                                                    onChange={() => { }}
                                                    disabled={true}
                                                />
                                            </div>
                                            {!selectedClass && (
                                                <>
                                                    <p style={{ color: "#607E9C", fontSize: "20px", fontWeight: "bold", marginTop: "10px", marginBottom: "10px" }}>Add students</p>
                                                    <CustomButton
                                                        icon={<IonIcon icon={Plus} color="#D929FF" style={{ fontSize: '24px' }} />}
                                                        btnText="Add"
                                                        background="#607E9C"
                                                        onClick={() => setIsModalOpen(true)}
                                                    />
                                                    <CommonInput
                                                        textHeader="Group name"
                                                        type="text"
                                                        value={classDetails.className}
                                                        placeholder="Enter name"
                                                        onChange={(e) => { setClassDetails({ ...classDetails, className: e.target.value }) }} />
                                                </>
                                            )}
                                            <CommonInput
                                                textHeader="Name of assignment"
                                                type="text"
                                                value={classDetails.assignmentName}
                                                placeholder="Enter name"
                                                onChange={(e) => setClassDetails({ ...classDetails, assignmentName: e.target.value })} />

                                            <CommonInput
                                                textHeader="Description"
                                                type="text"
                                                textarea={true}
                                                value={classDetails.description}
                                                placeholder="Enter description"
                                                onChange={(e) => setClassDetails({ ...classDetails, description: e.target.value })} />
                                            <p style={{ color: "#607E9C", fontSize: "20px", fontWeight: "bold", marginTop: "10px", marginBottom: "0px" }}>Select last submitting date</p>

                                            <div style={{ display: "flex", gap: "5px", width: "100%" }}>
                                                <div style={{ flex: 1 }}>
                                                    <label style={{ color: "#607E9C", fontSize: "20px", fontWeight: "bold", marginBottom: "8px", display: "block" }}>Due date</label>
                                                    {/* Custom input-like div for date picker */}
                                                    <div
                                                        style={{
                                                            width: "100%",
                                                            border: "2px solid #607E9C",
                                                            minHeight: "60px",
                                                            borderRadius: "50px",
                                                            padding: "16px",
                                                            fontSize: "20px",
                                                            color: classDetails.date ? "#607E9C" : "#A0A0A0",
                                                            background: "transparent",
                                                            outline: "none",
                                                            cursor: "pointer",
                                                            display: "flex",
                                                            alignItems: "center"
                                                        }}
                                                        onClick={() => setIsModalDateOpen(true)}
                                                    >
                                                        {classDetails.date ? classDetails.date.split('T')[0] : "Select date"}
                                                    </div>
                                                    {/* <CommonPopup isOpen={isModalDateOpen} setIsOpen={setIsModalDateOpen}>
                                                            <IonDatetime
                                                                presentation="date"
                                                                min={new Date().toISOString().split('T')[0]}
                                                                value={classDetails.date}
                                                                onIonChange={(e) => {
                                                                    let value = e.detail.value;
                                                                    if (Array.isArray(value)) value = value[0] || '';
                                                                    if (!value) value = '';
                                                                    setClassDetails({ ...classDetails, date: value });
                                                                    setIsModalOpen(false);
                                                                }}
                                                                style={{
                                                                    width: "100%",
                                                                    border: "2px solid #607E9C",
                                                                    minHeight: "60px",
                                                                    borderRadius: "50px",
                                                                    padding: "16px",
                                                                    fontSize: "20px",
                                                                    color: "#607E9C",
                                                                    background: "transparent",
                                                                    outline: "none"
                                                                }}
                                                            />
                                                        </CommonPopup> */}
                                                    <CommonPopup isOpen={isModalDateOpen} setIsOpen={setIsModalDateOpen}>
                                                        <IonDatetime
                                                            id="datetime"
                                                            min={new Date().toISOString().split('T')[0]}
                                                            presentation="date"
                                                            value={classDetails.date}
                                                        ></IonDatetime>
                                                        <div style={{ padding: "16px", textAlign: "right" }}>
                                                            <CustomButton
                                                                background="#FF8429"
                                                                btnText="Confirm"
                                                                onClick={() => {
                                                                    const datetimeEl = document.getElementById("datetime") as HTMLInputElement | null;
                                                                    const selectedDate = datetimeEl?.value || "";
                                                                    if (selectedDate) {
                                                                        setClassDetails({ ...classDetails, date: selectedDate });
                                                                    }
                                                                    setIsModalDateOpen(false);
                                                                }}
                                                            />
                                                        </div>
                                                    </CommonPopup>
                                                </div>
                                            </div>
                                            <CustomButton
                                                background="#FF8429"
                                                btnText="Schedule"
                                                onClick={() => { handleScheduleAssignment() }}
                                                isLoading={isSubmitting}
                                                style={{ marginTop: "10px" }}
                                                disable={
                                                    !classDetails.class ||
                                                    !classDetails.division ||
                                                    !classDetails.assignmentName ||
                                                    !classDetails.description ||
                                                    !classDetails.date ||
                                                    (!selectedClass ? selected.length === 0 || !classDetails.className : false)
                                                }
                                            />
                                        </div>
                                        <CommonPopup isOpen={isModalOpen} setIsOpen={setIsModalOpen} modalRef={selectStudentModalRef}>
                                            <CommonCard
                                                headerText={
                                                    <div style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        background: "#29B0FF",
                                                        borderTopLeftRadius: "12px",
                                                        borderTopRightRadius: "12px",
                                                        padding: "10px 16px"
                                                    }}>
                                                        <IonIcon
                                                            icon={BackArrowWhite}
                                                            style={{ fontSize: "20px", color: "#fff", cursor: "pointer", marginRight: "12px", height: "20px", width: "20px" }}
                                                            onClick={() => handleCloseModal()}
                                                        />
                                                        <span style={{
                                                            color: "#fff",
                                                            fontWeight: "bold",
                                                            fontSize: "20px",
                                                            letterSpacing: "1px"
                                                        }}>
                                                            SELECT STUDENTS
                                                        </span>
                                                        <div style={{ width: "32px" }}></div>
                                                    </div>
                                                }
                                            >
                                                <div style={{ maxHeight: "50vh", overflowY: "scroll", minWidth: "270px" }}>
                                                    {studentList?.map((person) => {
                                                        const isSelected = selected.includes(person.id);
                                                        return (
                                                            <div
                                                                key={person.id}
                                                                onClick={() => toggleSelect(person.id)}
                                                                style={{
                                                                    display: "flex",
                                                                    justifyContent: "space-between",
                                                                    alignItems: "center",
                                                                    margin: "8px 0",
                                                                    padding: "10px 16px",
                                                                    borderRadius: "20px",
                                                                    background: isSelected ? "#7891AB" : "#fff",
                                                                    color: isSelected ? "#fff" : "#607E9C",
                                                                    cursor: "pointer",
                                                                    border: "1px solid #607E9C",
                                                                }}
                                                            >
                                                                <span style={{ fontWeight: 500 }}>{person.name}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "10px" }}>
                                                    <CustomButton btnText="Save" background={"#FF0000"} txtColor={"white"} style={{ fontSize: "24px", width: "auto" }} onClick={() => { handleCloseModal() }} />
                                                </div>
                                            </CommonCard>
                                        </CommonPopup>
                                        <IonToast isOpen={showError} message={errorMessage} duration={2000} onDidDismiss={() => setShowError(false)}></IonToast>
                                    </>
                                )}
                                <IonToast isOpen={showEditToast} message={editToastMsg} duration={2000} onDidDismiss={() => setShowEditToast(false)} />
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
