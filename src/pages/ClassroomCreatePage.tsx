import { useHistory } from "react-router";
import CommonInput from "../components/common-component/Input";
import CustomButton from "../components/common-component/Button";
import { IonIcon, IonToast } from "@ionic/react";
import BackArrow from "../assets/left_arrow.svg"
import Plus from "../assets/plus.svg"
import PlusGray from "../assets/plus_gray.svg"
import CommonPopup from "../components/common-component/Popup";
import CommonCard from "../components/common-component/Card";
import { useEffect, useRef, useState } from "react";
import ClassRoomService from "../service/ClassroomService/ClassRoomService";
import CodeLinkService from "../service/CodeLinkService/CodeLinkService";

const ClassroomCreatePage = () => {
    const history = useHistory();
    const selectStudentModalRef = useRef();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [classDetails, setClassDetails] = useState({
        className: "",
        classNumber: "",
        classDivision: ""
    })
    const [selected, setSelected] = useState<number[]>([]);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [studentList, setStudentList] = useState([])

    console.log("selected", selected, classDetails)
    const toggleSelect = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleCreateClass = async () => {
        const reqObj = {
            Name: classDetails.className,
            Number: classDetails.classNumber,
            Section: classDetails.classDivision,
            studentIds: selected
        }
        const response = await ClassRoomService.createClassroomService(reqObj);
        if (response?.status === 200) {
            setErrorMessage(response?.data?.message)
            setShowError(true)
            console.log("response", response)
            history.push("/tabs/classroom");
        }
        handleCloseModal()
    }

    const handleCloseModal = () => {
        selectStudentModalRef.current?.dismiss();
    }

    const fetchStudents = async () => {
        const response = await CodeLinkService.fetchStudentsByDivisionService()
        if (response?.status == 200) {
            setStudentList(response?.data?.data)
        }
    }

    useEffect(() => {
        fetchStudents()
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
                <div style={{
                    padding: "0px 10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <IonIcon icon={BackArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { history.push("/tabs/classroom") }} />
                </div>
            </div>
            <div style={{ width: "100%", padding: "0px 10px", height: "70vh", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                    <CommonInput
                        textHeader="Class name"
                        placeholder="Enter name"
                        type="text"
                        value={classDetails.className}
                        onChange={(e) => setClassDetails({ ...classDetails, className: e.target.value })}
                    />
                    <CommonInput
                        textHeader="Class number"
                        placeholder="Enter number"
                        type="text"
                        value={classDetails.classNumber}
                        onChange={(e) => setClassDetails({ ...classDetails, classNumber: e.target.value })}
                    />
                    <CommonInput
                        textHeader="Class division"
                        placeholder="Enter division"
                        type="text"
                        value={classDetails.classDivision}
                        onChange={(e) => setClassDetails({ ...classDetails, classDivision: e.target.value })}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ color: "#607E9C", fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>Add students</p>
                        <p style={{ color: "#607E9C", fontSize: "16px", fontWeight: "bold", marginBottom: "20px" }}>{selected.length} students</p>
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
                        disable={classDetails.className === "" || classDetails.classNumber === "" || classDetails.classDivision === ""}
                        onClick={() => { handleCreateClass() }}
                    />
                </div>
                <CommonPopup isOpen={isModalOpen} setIsOpen={setIsModalOpen} modalRef={selectStudentModalRef}>
                    <CommonCard headerText="Select students">
                        <div style={{ maxHeight: "50vh", overflowY: "scroll", minWidth: "270px" }}>
                            {studentList?.map((person) => {
                                console.log("peopleinside", person)
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
        </div>
    )
}

export default ClassroomCreatePage;