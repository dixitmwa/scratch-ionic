import { IonIcon, IonModal, IonPage, useIonViewDidEnter, useIonViewDidLeave } from "@ionic/react";
import ChipCard from "../components/common-component/ChipCard";
import { arrowForwardOutline, volumeLowOutline, exitOutline, helpOutline, bookOutline, documentTextOutline, logOutOutline } from "ionicons/icons";
import { profileConstant } from "../constant/Constant";
import { useEffect, useRef, useState } from "react";
import CommonModal from "../components/common-component/Modal";
import MuteSound from "../assets/sound_mute.svg"
import UnMuteSound from "../assets/sound_unmute.svg"
import RightArrow from "../assets/right_arrow.svg"
import HowToPlay from "../assets/howtoplay.svg"
import CodeLink from "../assets/codelink.svg"
import Help from "../assets/help.svg"
import PrivacyPolicy from "../assets/privacypolicy.svg"
import TermsAndConditions from "../assets/termandcondition.svg"
import Logout from "../assets/logout.svg"
import Radio from "../assets/radio.svg"
import Plus from "../assets/plus.svg"
import CommonPopup from "../components/common-component/Popup";
import CustomButton from "../components/common-component/Button";
import { Preferences } from "@capacitor/preferences";
import CommonCard from "../components/common-component/Card";
import { useHistory } from "react-router";
import CustomDropdown from "../components/common-component/DropDown";
import CommonInput from "../components/common-component/Input";

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

const ProfilePage = () => {
    const history = useHistory()
    const modal = useRef<HTMLIonModalElement>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [constantData, setConstantData] = useState(profileConstant);
    const [selectedData, setSelectedData] = useState<any>(null);
    const logoutModalRef = useRef<HTMLIonModalElement>(null);
    const [isStudent, setIsStudent] = useState(true)
    const [newCodeGenerate, setNewCodeGenerate] = useState(false);
    const [selectedClass, setSelectedClass] = useState(true);
    const [classDetails, setClassDetails] = useState({
        class: "",
        division: "",
        classname: ""
    })
    const [selected, setSelected] = useState<number[]>([]);
    const [showGeneratedCode, setShowGeneratedCode] = useState(false)

    const toggleSelect = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleSubPages = (pageName: string) => {
        debugger
        const data = constantData.find((item) => item.route === pageName)
        console.log(pageName, data)
        if (data) {
            setSelectedData(data)
        }
    }

    const handleCloseModal = () => {
        logoutModalRef.current?.dismiss();
    }

    const handleLogOut = async () => {
        // await logout();
        await Preferences.clear();
        logoutModalRef.current?.dismiss();
        history.push('/login')
    }

    const handleBack = () => {
        setSelectedData(null)
    }

    const fetchUserType = async () => {
        const { value } = await Preferences.get({ key: "userType" })
        console.log("value------", value)
        if (value === "student") {
            setIsStudent(true)
        } else {
            setIsStudent(false)
        }
    }

    const generateCode = () => {
        setShowGeneratedCode(true)
        console.log("Code updating")
    }

    useIonViewDidEnter(() => {
        fetchUserType()
    })

    useEffect(() => {
        fetchUserType()
    }, [])

    console.log("isOpen", isModalOpen)

    return (
        // <IonPage>
        <div style={{
            margin: "54px 10px 10px 10px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
            maxHeight: "90vh",
            overflowY: "scroll"
        }}>
            {
                selectedData ? (
                    <CommonModal title={selectedData.title} description={selectedData.description} onClick={() => handleBack()}>
                        {/* {selectedData.children} */}
                        {
                            selectedData.route === "code-link" ? (
                                <>
                                    {
                                        newCodeGenerate ? (
                                            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "85%", overflowY: "scroll" }}>
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
                                                    {
                                                        !selectedClass && (
                                                            <>
                                                                <CommonInput
                                                                    textHeader="Class name"
                                                                    type="text"
                                                                    value={classDetails.class}
                                                                    placeholder="Enter name"
                                                                    onChange={(e) => { setClassDetails({ ...classDetails, classname: e.target.value }) }} />
                                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                    <p style={{ color: "#607E9C", fontSize: "20px", fontWeight: "bold", marginBottom: "0px" }}>Add students</p>
                                                                    <p style={{ color: "#607E9C", fontSize: "16px", fontWeight: "bold", marginBottom: "0px" }}>{selected.length} students</p>
                                                                </div>
                                                                <CustomButton background="#607E9C" icon={<IonIcon icon={Plus} />} btnText="Add" onClick={() => { setIsModalOpen(true) }} style={{ marginTop: "10px" }} />
                                                            </>
                                                        )
                                                    }
                                                    {
                                                        showGeneratedCode && (
                                                            <div>
                                                                <CommonInput textHeader="Code Link" copyInput={true} value={"Sdeggj"} />
                                                                <CommonInput textHeader="Product ID" copyInput={true} value={"Sdeggj"} />
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                                <div>
                                                    <CustomButton btnText="Generate code" background={"#FF8429"} txtColor={"white"} style={{ fontSize: "20px", marginTop: "10px", marginBottom: "10px" }} onClick={() => generateCode()} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", height: "55vh", width: "100%" }}>
                                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation</p>
                                                <div>
                                                    <CustomButton btnText="Generate New code" background={"#FF8429"} txtColor={"white"} style={{ fontSize: "20px" }} onClick={() => setNewCodeGenerate(true)} />
                                                    <CustomButton btnText="Code History" background={"#D929FF"} txtColor={"white"} style={{ fontSize: "20px", marginTop: "10px" }} onClick={() => history.push("/tabs/profile/code-history")} />
                                                </div>
                                            </div>
                                        )
                                    }
                                </>
                            ) : null
                        }
                    </CommonModal>
                ) : (
                    <>
                        <ChipCard title="Sound" icon={<IonIcon icon={MuteSound} color="primary" style={{ fontSize: '28px' }} onClick={() => { handleSubPages("sound") }} />} />
                        {isStudent ? (<ChipCard title={<div style={{ display: "flex", alignItems: "center", gap: "10px" }}><IonIcon icon={HowToPlay} style={{ fontSize: '28px' }} /> <p>How to play</p></div>}
                            icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '28px' }} onClick={() => { handleSubPages("how-to-play") }} />} />) :
                            (
                                <ChipCard title={<div style={{ display: "flex", alignItems: "center", gap: "10px" }}><IonIcon icon={CodeLink} style={{ fontSize: '28px' }} /> <p>Code Link</p></div>}
                                    icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '28px' }} onClick={() => { handleSubPages("code-link") }} />} />
                            )
                        }
                        <ChipCard title={<div style={{ display: "flex", alignItems: "center", gap: "10px" }}><IonIcon icon={Help} style={{ fontSize: '28px' }} /> <p>Help</p></div>}
                            icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '28px' }} onClick={() => { handleSubPages("help") }} />} />
                        <ChipCard title={<div style={{ display: "flex", alignItems: "center", gap: "10px" }}><IonIcon icon={PrivacyPolicy} style={{ fontSize: '28px' }} /> <p>Privacy policy</p></div>}
                            icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '28px' }} onClick={() => { handleSubPages("privacy-policy") }} />} />
                        <ChipCard title={<div style={{ display: "flex", alignItems: "center", gap: "10px" }}><IonIcon icon={TermsAndConditions} style={{ fontSize: '28px' }} /> <p>Terms and conditions</p></div>}
                            icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '28px' }} onClick={() => { handleSubPages("terms-and-conditions") }} />} />
                        <ChipCard title={<div style={{ display: "flex", alignItems: "center", gap: "10px" }}><IonIcon icon={Logout} style={{ fontSize: '28px' }} /> <p>Logout</p></div>}
                            icon={<IonIcon icon={RightArrow} id="open-logout-modal" color="primary" style={{ fontSize: '28px' }} onClick={() => { setIsModalOpen(true) }} />} />
                    </>
                )
            }
            <CommonPopup isOpen={isModalOpen} setIsOpen={setIsModalOpen} modalRef={logoutModalRef}>
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
                        <CustomButton btnText="Save" background={"#D929FF"} txtColor={"white"} style={{ fontSize: "24px", width: "auto" }} onClick={() => { handleCloseModal() }} />
                    </div>
                </CommonCard>
            </CommonPopup>
        </div>
        // </IonPage>
    )
}

export default ProfilePage;