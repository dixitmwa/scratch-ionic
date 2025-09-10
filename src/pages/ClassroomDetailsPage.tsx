import { IonIcon, IonToast, IonSpinner } from "@ionic/react";
import BackArrow from "../assets/left_arrow.svg"
import BackArrowWhite from "../assets/left_arrow_white.svg"
import { useHistory } from "react-router";
import ChipCard from "../components/common-component/ChipCard";
import View from "../assets/view.svg"
import CustomButton from "../components/common-component/Button";
import EditButton from "../assets/edit_button.svg"
import SearchInput from "../components/common-component/SearchInput";
import { useEffect, useRef, useState } from "react";
import ClassRoomService from "../service/ClassroomService/ClassRoomService";
import CodeLinkService from "../service/CodeLinkService/CodeLinkService";
import CommonInput from "../components/common-component/Input";
import CommonPopup from "../components/common-component/Popup";
import CommonCard from "../components/common-component/Card";
import Plus from "../assets/plus.svg"
import { Preferences } from "@capacitor/preferences";
import Loader from "../components/common-component/Loader";
import { useSection } from "../context/SectionContext";

const ClassroomDetailsPage = () => {
    const history = useHistory()
    const [classDetail, setClassDetail] = useState<ClassDetails>({ name: '', number: '', division: '' });
    const [selectedStudentList, setSelectedStudentList] = useState<number[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isEdit, setIsEdit] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    // const [selectedStudentDetail, setSelectedStudentDetail] = useState<Student | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const selectStudentModalRef = useRef<HTMLIonModalElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [classDetails, setClassDetails] = useState<ClassDetails>({
        name: "",
        number: "",
        division: ""
    });
    const [studentList, setStudentList] = useState<Student[]>([]);

    const [studentProjects, setStudentProjects] = useState<any[]>([]);
    const { sectionId, setSectionId } = useSection();

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
        setIsLoading(true);
        console.log("sectionId", sectionId);
        if (!sectionId) {
            setIsLoading(false);
            setShowError(true);
            setErrorMessage("No section selected");
            return;
        }
        const response = await ClassRoomService.fetchSectionByIdService(sectionId);
        if (response?.status === 200) {
            setClassDetail(response?.data?.data);
            await fetchStudents();
            const studentResponse = await CodeLinkService.fetchStudentsByDivisionService({ sectionId });
            if (studentResponse?.status === 200) {
                const selectedStudentIds = studentResponse?.data?.data?.map((student: Student) => student.id) || [];
                setSelectedStudentList(selectedStudentIds);
            }
        }
        setIsLoading(false);
    }

    const fetchStudents = async () => {
        const response = await CodeLinkService.fetchStudentsByDivisionService();
        if (response?.status === 200) {
            const students: Student[] = response?.data?.data || [];
            setStudentList(students);
        }
    }

    const handleUpdateClass = async () => {
        setIsLoading(true);
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
        setIsLoading(false);
    }

    const handleCloseModal = () => {
        selectStudentModalRef.current?.dismiss();
    }

    const showStudentProject = async (student: Student) => {
        debugger
        const response = await ClassRoomService.fetchStudentProjectsService(student.id.toString());
        if (response?.status === 200) {
            setStudentProjects(response?.data?.data || []);
            setSelectedStudent(student);
        }
    }

    useEffect(() => {
        fetchClassroomDetail()
    }, [])

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
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", width: "100%" }}>
                        <IonIcon icon={BackArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { !isEdit ? !selectedStudent ? history.push("/tabs/classroom") : setSelectedStudent(null) : setIsEdit(false) }} />
                        {!isEdit && !selectedStudent && (
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
                            selectedStudent && (
                                <>
                                    <div>
                                        <p style={{ color: "#607E9C", fontSize: "24px", fontWeight: "bold", marginBottom: "0px", marginTop: "0px", textAlign: "center" }}>{selectedStudent.name}</p>
                                        <p style={{ color: "#607E9C", textAlign: "center", fontSize: "18px", marginBottom: "0px", marginTop: "0px" }}>{selectedStudent.mobileNumber}</p>
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
                                                style={{ fontSize: "20px", color: "#fff", cursor: "pointer", marginRight: "12px" }}
                                                onClick={() => setIsModalOpen(false)}
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
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "10px" }}>
                                        <CustomButton btnText="Save" background={"#FF0000"} txtColor={"white"} style={{ fontSize: "24px", width: "auto" }} onClick={() => { setIsModalOpen(false) }} />
                                    </div>
                                </CommonCard>
                            </CommonPopup>
                        </div>
                        <IonToast isOpen={showError} message={errorMessage} duration={2000} onDidDismiss={() => setShowError(false)}></IonToast>
                    </>
                    ) : selectedStudent ? (<>
                        {
                            studentProjects && studentProjects.length > 0 ? (
                                studentProjects.map((project, index) => (
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
                                            />
                                        }
                                    />
                                ))
                            ) : (
                                <div style={{ width: '100%', textAlign: 'center', color: '#607E9C', marginTop: '32px', fontSize: '20px', fontWeight: 500 }}>
                                    No project found
                                </div>
                            )
                        }
                    </>)
                        : (<>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "0px 10px" }}>
                                <p style={{ color: "#607E9C", fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>{classDetail?.className + " " + classDetail?.name}</p>
                                <p style={{ color: "#607E9C", fontSize: "16px", fontWeight: "bold", marginBottom: "20px", marginTop: "20px" }}>{selectedStudentList?.length} students</p>
                            </div>
                            {
                                studentList
                                    ?.filter(student => selectedStudentList.includes(student.id))
                                    ?.map((student, index) => (
                                        <ChipCard
                                            key={student.id}
                                            textTransform={true}
                                            count={index + 1}
                                            title={
                                                <div style={{ display: "flex", flexDirection: "column" }}>
                                                    <p style={{ margin: "0px", fontWeight: 600, fontSize: "20px" }}>{student.name}</p>
                                                </div>
                                            }
                                            onClick={() => { showStudentProject(student) }}
                                            icon={
                                                <IonIcon
                                                    icon={View}
                                                    color="primary"
                                                    style={{ fontSize: '32px' }}
                                                    onClick={() => { showStudentProject(student) }}
                                                />
                                            }
                                        />
                                    ))
                            }
                        </>)
                }
            </div >
        )
    )
}

export default ClassroomDetailsPage;