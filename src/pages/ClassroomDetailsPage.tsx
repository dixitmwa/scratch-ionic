import { IonIcon, IonToast } from "@ionic/react";
import BackArrow from "../assets/left_arrow.svg"
import { useHistory } from "react-router";
import ChipCard from "../components/common-component/ChipCard";
import View from "../assets/view.svg"
import CustomButton from "../components/common-component/Button";
import EditButton from "../assets/edit_button.svg"
import SearchInput from "../components/common-component/SearchInput";
import { useEffect, useRef, useState } from "react";
import ClassRoomService from "../service/ClassroomService/ClassRoomService";
import CodeLinkService from "../service/CodeLinkService/CodeLinkService";

interface Student {
    id: number;
    name: string;
}

interface ClassDetails {
    name: string;
    number: string;
    division: string;
    className?: string;
    classNumber?: string;
}
import CommonInput from "../components/common-component/Input";
import CommonPopup from "../components/common-component/Popup";
import CommonCard from "../components/common-component/Card";
import Plus from "../assets/plus.svg"
import { Preferences } from "@capacitor/preferences";

const ClassroomDetailsPage = () => {
    const history = useHistory()
    const [classDetail, setClassDetail] = useState<ClassDetails>({});
    const [selectedStudentList, setSelectedStudentList] = useState<number[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isEdit, setIsEdit] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const selectStudentModalRef = useRef<HTMLIonModalElement>(null);
    const [classDetails, setClassDetails] = useState<ClassDetails>({
        name: "",
        number: "",
        division: ""
    });
    const [studentList, setStudentList] = useState<Student[]>([]);
    const [studentProjects, setStudentProjects] = useState<any[]>([]);

    console.log("classDetail", classDetail, selectedStudentList, classDetails, studentList)
    const handleSearch = () => {
        console.log(inputValue)
    }

    const toggleSelect = (id: number) => {
        setSelectedStudentList((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const isStudentSelected = (studentId: number) => {
        return selectedStudentList.includes(studentId);
    };

    const fetchClassroomDetail = async () => {
        const { value } = await Preferences.get({ key: "sectionId" });
        console.log('value', value)
        debugger
        const response = await ClassRoomService.fetchSectionByIdService(value);
        if (response?.status === 200) {
            setClassDetail(response?.data?.data);
            // First fetch all available students
            await fetchStudents();
            // Then fetch students in this class
            const studentResponse = await CodeLinkService.fetchStudentsByDivisionService({ sectionId: value });
            if (studentResponse?.status === 200) {
                // Map the student IDs from the response to create an array of selected student IDs
                const selectedStudentIds = studentResponse?.data?.data?.map((student: Student) => student.id) || [];
                setSelectedStudentList(selectedStudentIds);
            }
        }
    }

    const fetchStudents = async () => {
        const response = await CodeLinkService.fetchStudentsByDivisionService();
        if (response?.status === 200) {
            const students: Student[] = response?.data?.data || [];
            setStudentList(students);
        }
    }

    const handleUpdateClass = async () => {
        const reqObj = {
            className: classDetail.className,
            classNumber: classDetail.classNumber,
            sectionName: classDetail.name,
            studentIds: selectedStudentList
        }
        debugger
        const response = await ClassRoomService.updateClassroomService({
            classId: classDetail.classId,
            sectionId: classDetail.id
        }, reqObj)
        if (response?.status === 200) {
            setShowError(true);
            setErrorMessage("Class updated successfully");
            setIsEdit(false);
            fetchClassroomDetail();
        }
    }

    const handleCloseModal = () => {
        selectStudentModalRef.current?.dismiss();
    }

    const showStudentProject = async (studentId: number) => {
        debugger
        const response = await ClassRoomService.fetchStudentProjectsService(studentId.toString());
        if (response?.status === 200) {
            setStudentProjects(response?.data?.data || []);
            setSelectedStudentId(studentId);
        }
    }

    useEffect(() => {
        fetchClassroomDetail()
    }, [])

    return (
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", width: "100%" }}>
                    <IonIcon icon={BackArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { !isEdit ? !selectedStudentId ? history.push("/tabs/classroom") : setSelectedStudentId(null) : setIsEdit(false) }} />
                    {!isEdit && !selectedStudentId && (
                        <>
                            <SearchInput
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onSearch={handleSearch}
                            />
                            <IonIcon icon={EditButton} color="#D929FF" style={{ fontSize: '38px' }} onClick={() => { setIsEdit(true) }} />
                        </>
                    )}
                    {
                        selectedStudentId && (
                            <>
                                <div>
                                    <p style={{ color: "#607E9C", fontSize: "24px", fontWeight: "bold", marginBottom: "0px", marginTop: "0px" }}>Lara Simmons</p>
                                    <p style={{ color: "#607E9C", textAlign: "center", fontSize: "18px", marginBottom: "0px", marginTop: "0px" }}>+1 98765 43210</p>
                                </div>
                                <div style={{ width: "28px" }}></div>
                            </>
                        )
                    }
                </div>
            </div>
            {
                isEdit ? (<>
                    <div style={{ width: "100%", padding: "0px 10px", height: "70vh", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <div>
                            <CommonInput
                                textHeader="Class name"
                                placeholder="Enter name"
                                type="text"
                                value={classDetail.className}
                                disabled={true}
                                onChange={(e) => setClassDetail({ ...classDetail, className: e.target.value })}
                            />
                            <CommonInput
                                textHeader="Class number"
                                placeholder="Enter number"
                                type="text"
                                value={classDetail.classNumber}
                                disabled={true}
                                onChange={(e) => setClassDetail({ ...classDetail, classNumber: e.target.value })}
                            />
                            <CommonInput
                                textHeader="Class division"
                                placeholder="Enter division"
                                type="text"
                                value={classDetail.name}
                                onChange={(e) => setClassDetail({ ...classDetail, name: e.target.value })}
                            />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <p style={{ color: "#607E9C", fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>Add students</p>
                                <p style={{ color: "#607E9C", fontSize: "16px", fontWeight: "bold", marginBottom: "20px" }}>{selectedStudentList.length} students</p>
                            </div>
                            <CustomButton
                                icon={<IonIcon icon={Plus} color="#D929FF" style={{ fontSize: '24px' }} />}
                                btnText="Add"
                                background="#607E9C"
                                onClick={() => setIsModalOpen(true)}
                            />
                        </div>
                        <div>
                            <CustomButton
                                btnText="Save"
                                background="#D929FF"
                                disable={classDetail.className === "" || classDetail.number === "" || classDetail.name === ""}
                                onClick={() => { handleUpdateClass() }}
                            />
                        </div>
                        <CommonPopup isOpen={isModalOpen} setIsOpen={setIsModalOpen} modalRef={selectStudentModalRef}>
                            <CommonCard headerText="Select students">
                                <div style={{ maxHeight: "50vh", overflowY: "scroll", minWidth: "270px" }}>
                                    {studentList?.map((person) => {
                                        console.log("peopleinside", person)
                                        const isSelected = isStudentSelected(person.id);
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
                                                {/* {!isSelected && <IonIcon icon={PlusGray} style={{ fontSize: '18px', height: "18px", width: "18px" }} color="danger" />} */}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "10px" }}>
                                    {/* <CustomButton btnText="Close" background={"#D929FF"} txtColor={"white"} style={{ fontSize: "24px", width: "auto" }} onClick={() => { handleCloseModal() }} /> */}
                                    <CustomButton btnText="Save" background={"#FF0000"} txtColor={"white"} style={{ fontSize: "24px", width: "auto" }} onClick={() => { handleCloseModal() }} />
                                </div>
                            </CommonCard>
                        </CommonPopup>
                    </div>
                    <IonToast isOpen={showError} message={errorMessage} duration={2000} onDidDismiss={() => setShowError(false)}></IonToast>
                </>
                ) : selectedStudentId ? (<>
                    {
                        studentProjects?.map((project, index) => (
                            <ChipCard
                                key={index}
                                count={index + 1}
                                title={project.title || "test"}
                                rightBorder={project.isSubmitted}
                                icon={
                                    <IonIcon
                                        icon={View}
                                        color="primary"
                                        style={{ fontSize: '32px' }}
                                    // onClick={() => { showStudentProject(student.id) }}
                                    />
                                }
                            // onClick={() => { /* Handle project click */ }}
                            />
                        ))
                    }
                </>)
                    : (<>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "0px 10px" }}>
                            <p style={{ color: "#607E9C", fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>{classDetail?.className + " " + classDetail?.name}</p>
                            <p style={{ color: "#607E9C", fontSize: "16px", fontWeight: "bold", marginBottom: "20px", marginTop: "20px" }}>{selectedStudentList?.length} students</p>
                        </div>
                        {
                            // Filter studentList to only include selected students and map through them
                            studentList
                                ?.filter(student => selectedStudentList.includes(student.id))
                                ?.map((student) => (
                                    <ChipCard
                                        key={student.id}
                                        textTransform={true}
                                        count={1}
                                        title={
                                            <div style={{ display: "flex", flexDirection: "column" }}>
                                                <p style={{ margin: "0px", fontWeight: 600, fontSize: "20px" }}>{student.name}</p>
                                            </div>
                                        }
                                        icon={
                                            <IonIcon
                                                icon={View}
                                                color="primary"
                                                style={{ fontSize: '32px' }}
                                                onClick={() => { showStudentProject(student.id) }}
                                            />
                                        }
                                    />
                                ))
                        }
                    </>)
            }

        </div >
    )
}

export default ClassroomDetailsPage;