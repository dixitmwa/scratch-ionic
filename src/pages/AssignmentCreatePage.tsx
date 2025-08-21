import { useRef, useState } from "react";
import { IonIcon } from "@ionic/react";
import BackArrow from "../assets/left_arrow.svg"
import { useHistory } from "react-router";
import CustomButton from "../components/common-component/Button";
import Radio from "../assets/radio.svg"
import CommonInput from "../components/common-component/Input";
import CustomDropdown from "../components/common-component/DropDown";
import CommonPopup from "../components/common-component/Popup";
import CommonCard from "../components/common-component/Card";
import Plus from "../assets/plus.svg"

const people = [
    { id: 1, name: "John Wordan" },
    { id: 2, name: "Hethu Jackson" },
    { id: 3, name: "Alice Johnson" },
    { id: 4, name: "Michael Smith" },
    { id: 5, name: "Emily Davis" },
    { id: 6, name: "David Brown" },
    { id: 7, name: "Sarah Wilson" },
    { id: 8, name: "James Taylor" },
    { id: 9, name: "Sophia Miller" },
    { id: 10, name: "Daniel Anderson" },
    { id: 11, name: "Daniel Anderson" },
    { id: 12, name: "Daniel Anderson" },
    { id: 13, name: "Daniel Anderson" },
    { id: 14, name: "Daniel Anderson" },
];

const AssignmentCreatePage = () => {
    const history = useHistory()
    const [selectedClass, setSelectedClass] = useState(true)
    const selectStudentModalRef = useRef();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [classDetails, setClassDetails] = useState({
        class: "",
        division: "",
        assignmentName: "",
        description: "",
        date: "",
        month: "",
        year: ""
    })
    const [selected, setSelected] = useState<number[]>([]);

    const toggleSelect = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleCloseModal = () => {
        selectStudentModalRef.current?.dismiss();
    }

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
                        onChange={(val: any) => setClassDetails({ ...classDetails, class: val })}
                        options={[
                            "5th",
                            "6th",
                            "7th",
                            "8th",
                            "9th",
                            "10th",
                            "11th",
                            "12th"
                        ]} />
                    <CustomDropdown
                        placeholder="Division"
                        value={classDetails.division}
                        onChange={(val: any) => setClassDetails({ ...classDetails, division: val })}
                        options={[
                            "A",
                            "B",
                            "C",
                            "D"
                        ]} />
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
                            textHeader="Class name"
                            type="text"
                            value={classDetails.class}
                            placeholder="Enter name"
                            onChange={(e) => { setClassDetails({ ...classDetails, class: e.target.value }) }} />
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

                <div style={{ display: "flex", gap: "5px" }}>

                    <CustomDropdown
                        placeholder="Date"
                        value={classDetails.date}
                        onChange={(val: any) => setClassDetails({ ...classDetails, date: val })}
                        options={[
                            "5th",
                            "6th",
                            "7th",
                            "8th",
                            "9th",
                            "10th",
                            "11th",
                            "12th"
                        ]} />
                    <CustomDropdown
                        placeholder="Month"
                        value={classDetails.month}
                        onChange={(val: any) => setClassDetails({ ...classDetails, month: val })}
                        options={[
                            "5th",
                            "6th",
                            "7th",
                            "8th",
                            "9th",
                            "10th",
                            "11th",
                            "12th"
                        ]} />
                    <CustomDropdown
                        placeholder="Year"
                        value={classDetails.year}
                        onChange={(val: any) => setClassDetails({ ...classDetails, year: val })}
                        options={[
                            "5th",
                            "6th",
                            "7th",
                            "8th",
                            "9th",
                            "10th",
                            "11th",
                            "12th"
                        ]} />
                </div>
                <CustomButton background="#FF8429" btnText="Schedule" onClick={() => { history.push("/tabs/assignment") }} style={{ marginTop: "10px" }} />
            </div>
            <CommonPopup isOpen={isModalOpen} setIsOpen={setIsModalOpen} modalRef={selectStudentModalRef}>
                <CommonCard headerText="Select students">
                    <div style={{ maxHeight: "50vh", overflowY: "scroll", minWidth: "270px" }}>
                        {people?.map((person) => {
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
    )
}

export default AssignmentCreatePage;