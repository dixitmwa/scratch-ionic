import { useEffect, useRef, useState } from "react";
import { IonDatetimeButton, IonModal, IonDatetime } from "@ionic/react";
import { IonIcon, IonToast } from "@ionic/react";
import BackArrow from "../assets/left_arrow.svg"
import BackArrowWhite from "../assets/left_arrow_white.svg";
import { useHistory } from "react-router";
import CustomButton from "../components/common-component/Button";
import Radio from "../assets/radio.svg"
import CommonInput from "../components/common-component/Input";
import CustomDropdown from "../components/common-component/DropDown";
import CommonPopup from "../components/common-component/Popup";
import CommonCard from "../components/common-component/Card";
import Plus from "../assets/plus.svg"
import CodeLinkService from "../service/CodeLinkService/CodeLinkService";
import AssignmentService from "../service/AssignmentService/AssignmentService";

const AssignmentCreatePage = () => {
    const history = useHistory()
    const [selectedClass, setSelectedClass] = useState(true)
    // Fix ref type for IonModal
    const selectStudentModalRef = useRef<HTMLIonModalElement>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [classDivisionData, setClassDivisionData] = useState<any[]>([]);
    const [studentList, setStudentList] = useState<any[]>([]);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isModalDateOpen, setIsModalDateOpen] = useState(false);
    const [classDetails, setClassDetails] = useState({
        class: "",
        division: "",
        assignmentName: "",
        className: "",
        description: "",
        date: "",
    })
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


    const toggleSelect = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleCloseModal = () => {
        selectStudentModalRef.current?.dismiss && selectStudentModalRef.current.dismiss();
    }

    const fetchClassAndDiv = async () => {
        const response = await CodeLinkService.fetchClassAndDivisionService()
        if (response?.status === 200) {
            setClassDivisionData(response?.data?.data)
        }
    }

    const handleScheduleAssignment = async () => {
        setIsLoading(true)
        debugger
        const reqObj = {
            title: classDetails.assignmentName,
            description: classDetails.description,
            endDate: classDetails.date,
            classId: selectedOptions.class,
            sectionId: selectedOptions.division,
            studentIds: selected,
            className: classDetails.className || undefined
            // classDetails,
            // selectedOptions,
            // selected
        }
        // return
        const response = await AssignmentService.createAssignmentService(reqObj);
        console.log("response", response)
        if (response?.status === 200) {
            setErrorMessage(response?.data?.message)
            setShowError(true)
            history.push("/tabs/assignment");
        }
        console.log("-----req", classDetails, selectedOptions, selected)
        setIsLoading(false)
    }

    const fetchStudentByDivision = async () => {
        debugger
        if (selectedOptions.class && selectedOptions.division) {
            const response = await CodeLinkService.fetchStudentsByDivisionService({ classId: selectedOptions.class, sectionId: selectedOptions.division })
            if (response?.status === 200) {
                debugger
                setStudentList(response?.data?.data)
                console.log("response", response)
            }
        }
    }

    useEffect(() => {
        if (!selectedClass) {
            fetchStudentByDivision()
        }
    }, [selectedClass, selectedOptions.class, selectedOptions.division])

    useEffect(() => {
        fetchClassAndDiv()
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
                    <IonIcon icon={BackArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { history.push("/tabs/assignment") }} />
                    <p style={{ color: "#607E9C", fontSize: "20px", fontWeight: "bold", margin: "0px", textAlign: "center" }}>Create Assignment</p>
                    <div style={{ width: "32px" }}></div>
                </div>
            </div>
            <div>
                <div style={{ display: "flex", gap: "10px", margin: "10px 0px" }}>
                    <CustomButton icon={<IonIcon icon={Radio} />} btnText="Class" background={selectedClass ? "#29B0FF" : "#FFFFFF"} txtColor={selectedClass ? "white" : "#607E9C"} style={{ fontSize: "18px", textTransform: "capitalize", ...(!selectedClass && { border: "1px solid #607E9C" }) }} onClick={() => setSelectedClass(true)} />
                    <CustomButton icon={<IonIcon icon={Radio} />} btnText="Students" background={!selectedClass ? "#29B0FF" : "#FFFFFF"} txtColor={!selectedClass ? "white" : "#607E9C"} style={{ fontSize: "18px", textTransform: "capitalize", ...(selectedClass && { border: "1px solid #607E9C" }) }} onClick={() => setSelectedClass(false)} />
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
                        onChange={(val: any) => {
                            setClassDetails({ ...classDetails, class: val.value, division: '' })
                            setSelectedOptions({ ...selectedOptions, class: val.value, division: '' })
                        }}
                        isSearchable={true}
                        options={classOptions} />
                    <CustomDropdown
                        placeholder="Division"
                        value={classDetails.division}
                        onChange={(val: any) => {
                            setClassDetails({ ...classDetails, division: val.value })
                            setSelectedOptions({ ...selectedOptions, division: val.value })
                        }}
                        isSearchable={true}
                        options={divisionOptions} />
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
                    onChange={(e) => { setClassDetails({ ...classDetails, assignmentName: e.target.value }) }} />

                <CommonInput
                    textHeader="Description"
                    type="text"
                    textarea={true}
                    value={classDetails.description}
                    placeholder="Enter description"
                    onChange={(e) => { setClassDetails({ ...classDetails, description: e.target.value }) }} />
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
                            onClick={() =>  setIsModalDateOpen(true)}
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
                    isLoading={isLoading}
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
        </div>
    )
}

export default AssignmentCreatePage;