import { IonIcon, IonToast, useIonRouter, useIonViewDidEnter } from "@ionic/react";
import ChipCard from "../components/common-component/ChipCard";
import BackArrowWhite from "../assets/left_arrow_white.svg"
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
import Profile from "../assets/profile.svg"
import CommonPopup from "../components/common-component/Popup";
import CustomButton from "../components/common-component/Button";
import { Preferences } from "@capacitor/preferences";
import { useAuth } from "../service/AuthService/AuthContext";
import CommonCard from "../components/common-component/Card";
import { useHistory } from "react-router";
import CustomDropdown from "../components/common-component/DropDown";
import CommonInput from "../components/common-component/Input";
import CodeLinkService from "../service/CodeLinkService/CodeLinkService";
import AuthService from "../service/AuthService/AuthService";

const ProfilePage = () => {
    const history = useHistory()
    const router = useIonRouter();
    const modal = useRef<HTMLIonModalElement>(null);
    const [studentList, setStudentList] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [constantData, setConstantData] = useState(profileConstant);
    const [selectedData, setSelectedData] = useState<any>(null);
    const logoutModalRef = useRef<HTMLIonModalElement>(null);
    const classModalRef = useRef<HTMLIonModalElement>(null);
    const [isStudent, setIsStudent] = useState(true)
    const [newCodeGenerate, setNewCodeGenerate] = useState(false);
    const [selectedClass, setSelectedClass] = useState(true);
    const [classDetails, setClassDetails] = useState({
        class: "",
        division: "",
        classname: ""
    })
    const [isLoading, setIsLoading] = useState(false);
    const [loadingLogOut, setLoadingLogOut] = useState(false)
    const [selected, setSelected] = useState<number[]>([]);
    const [showGeneratedCode, setShowGeneratedCode] = useState(false)
    const [classDivisionData, setClassDivisionData] = useState([]);
    const [generatedCode, setGeneratedCode] = useState("");
    const [userDetails, setUserDetails] = useState<any>({})
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [profileData, setProfileData] = useState({
        name: '',
        school: '',
        className: '',
        section: '',
    });
    const [classesDetails, setClassesDetails] = useState({
        class: '',
        division: ''
    });
    const classOptions = classDivisionData.map(item => ({
        label: item.classNumber,
        value: item.classId
    }));

    console.log(profileData)
    // const divisionOptionsRaw = classDivisionData.find(
    //     item => item.className === classDetails.class
    // )?.sections || [];

    // const divisionOptions = divisionOptionsRaw.map(section => section.sectionName);

    const divisionOptionsRaw = classDivisionData.find(
        item => item.classId === classDetails.class
    )?.sections || [];

    const divisionOptions = divisionOptionsRaw.map((section: any) => ({
        label: section.sectionName,
        value: section.sectionId
    }));

    // const uniqueDivisions = [
    //     ...new Set(divisionOptions.map(section => section.sectionName))
    // ];
    const toggleSelect = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };
    const handleSubPages = (pageName: string) => {
        const data = constantData.find((item) => item.route === pageName)
        if (data) {
            setSelectedData(data)
        }
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
        logoutModalRef.current?.dismiss();
    }

    const handleCloseClassModal = () => {
        classModalRef.current?.dismiss();
    }

    const { logout } = useAuth();
    const handleLogOut = async () => {
        setLoadingLogOut(true);
        // Dismiss all modals and reset UI state BEFORE logout
        setIsModalOpen(false);
        // Wait for modal to close before logout
        await logout();
        setTimeout(async () => {
            logoutModalRef.current?.dismiss();
            history.replace('/login');
            setLoadingLogOut(false);
        }, 300);
    };

    const handleBack = () => {
        setNewCodeGenerate(false)
        setSelectedData(null)
    }

    const fetchUserType = async () => {
        const { value } = await Preferences.get({ key: "userType" })
        if (value?.toLowerCase() === "student") {
            setIsStudent(true)
        } else {
            setIsStudent(false)
        }

        const responseProfile = await AuthService.fetchLoggedUserDetailsByIdService();
        console.log("responseProfile", responseProfile);
        if (responseProfile?.status === 200) {
            setUserDetails(responseProfile?.data?.data);
        }

        const response = await CodeLinkService.fetchClassAndDivisionService()
        console.log("response", response)
        if (response?.status === 200) {
            setClassDivisionData(response?.data?.data)
        }
    }

    const generateCode = async () => {
        const reqObj = selectedClass ? {
            type: "Class",
            classId: classDetails.class,
            sectionId: classDetails.division
        } : {
            type: "Student",
            classId: classDetails.class,
            sectionId: classDetails.division,
            classname: classDetails.classname,
            userId: selected
        };
        const response = await CodeLinkService.generateCodeService(reqObj);
        console.log("Code updating", response);
        if (response?.status === 200) {
            setGeneratedCode(response?.data?.data?.code || "")
            setShowGeneratedCode(true);
        }
        console.log("Code updating");
    }

    const fetchStudentByDivision = async () => {
        debugger
        if (classDetails.class && classDetails.division) {
            const response = await CodeLinkService.fetchStudentsByDivisionService({ classId: classDetails.class, sectionId: classDetails.division })
            if (response?.status === 200) {
                debugger
                setStudentList(response?.data?.data)
                console.log("response", response)
            }
        }
    }

    const updateProfile = async () => {
        setIsLoading(true);
        debugger
        const reqObj = {
            Name: userDetails?.name,
            // classId: classDetails.class,
            // sectionId: classDetails.division,
            // userId: selected
        };

        const response = await AuthService.updateProfileService(reqObj);
        if (response?.status === 200) {
            setShowError(true);
            setErrorMessage(response?.data?.message);
        }
        setIsLoading(false);
    }

    useIonViewDidEnter(() => {
        fetchUserType();
    });

    useEffect(() => {
        fetchUserType();
    }, []);

    useEffect(() => {
        if (!selectedClass) {
            fetchStudentByDivision()
        }
    }, [selectedClass, classDetails.class, classDetails.division])

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
                                                            onChange={(val: any) => {
                                                                setClassDetails({ ...classDetails, class: val.value, division: '' });
                                                                setClassesDetails({ class: val.value, division: '' });
                                                            }}
                                                            isSearchable={true}
                                                            options={classOptions} />
                                                        <CustomDropdown
                                                            placeholder="Division"
                                                            value={classDetails.division}
                                                            onChange={(val: any) => {
                                                                setClassDetails({ ...classDetails, division: val.value });
                                                                setClassesDetails({ ...classesDetails, division: val.value });
                                                            }}
                                                            isSearchable={true}
                                                            options={divisionOptions} />
                                                    </div>
                                                    {
                                                        !selectedClass && (
                                                            <>
                                                                <CommonInput
                                                                    textHeader="Class name"
                                                                    type="text"
                                                                    value={classDetails.classname}
                                                                    placeholder="Enter name"
                                                                    onChange={(e) => { setClassDetails({ ...classDetails, classname: e.target.value }) }} />
                                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                    <p style={{ color: "#607E9C", fontSize: "20px", fontWeight: "bold", marginBottom: "0px" }}>Add students</p>
                                                                    <p style={{ color: "#607E9C", fontSize: "16px", fontWeight: "bold", marginBottom: "0px" }}>{selected.length} students</p>
                                                                </div>
                                                                <CustomButton background="#607E9C" icon={<IonIcon icon={Plus} />} btnText="Add" onClick={() => { setIsClassModalOpen(true) }} style={{ marginTop: "10px" }} />
                                                            </>
                                                        )
                                                    }
                                                    {
                                                        showGeneratedCode && (
                                                            <div>
                                                                <CommonInput textHeader="Code Link" copyInput={true} value={generatedCode} />
                                                                <CommonInput textHeader="Product ID" copyInput={true} value={generatedCode} />
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                                <div>
                                                    <CustomButton btnText="Generate code" background={"#FF8429"} txtColor={"white"} style={{ fontSize: "20px", marginTop: "10px", marginBottom: "10px" }} disable={!classDetails.class || !classDetails.division || (selectedClass ? false : (!classDetails.classname || selected.length === 0))} onClick={() => generateCode()} />
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
                            ) : selectedData.route === "edit-profile" ? (
                                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "85%", overflowY: "scroll" }}>
                                    <div>
                                        <CommonInput
                                            textHeader="Name"
                                            type="text"
                                            value={userDetails?.name}
                                            placeholder="Enter name"
                                            onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })} />
                                        <CommonInput
                                            textHeader="School"
                                            type="text"
                                            value={userDetails?.schoolName}
                                            placeholder="Enter school"
                                            disabled={true}
                                            onChange={(e) => setProfileData({ ...profileData, school: e.target.value })} />
                                        <div style={{ display: "flex", gap: "10px" }}>
                                            <CustomDropdown
                                                textHeader="Class"
                                                value={userDetails.classId}
                                                options={classDivisionData.map(item => ({ label: item.classNumber, value: item.classId }))}
                                                onChange={(val: any) => setProfileData({ ...profileData, className: val })}
                                                disabled={true}
                                            />
                                            <CustomDropdown
                                                textHeader="Section"
                                                value={userDetails.sectionId}
                                                options={(() => {
                                                    const selectedClassObj = classDivisionData.find(item => item.classId === userDetails.classId);
                                                    return (selectedClassObj?.sections || []).map((section: any) => ({ label: section.sectionName, value: section.sectionId }));
                                                })()}
                                                onChange={(val: any) => setProfileData({ ...profileData, section: val })}
                                                disabled={true}
                                            />
                                        </div>
                                        <CommonInput
                                            textHeader="Email/Mobile"
                                            value={userDetails?.email || userDetails?.mobileNumber}
                                            disabled={true}
                                            onChange={(val: any) => setProfileData({ ...profileData, email: val })}
                                        />
                                    </div>
                                    <div>
                                        <CustomButton isLoading={isLoading} btnText="Update profile" background={"#FF8429"} txtColor={"white"} style={{ fontSize: "20px", marginTop: "10px", marginBottom: "10px" }} disable={false} onClick={() => updateProfile()} />
                                    </div>
                                </div>
                            ) : null
                        }
                    </CommonModal>
                ) : (
                    <>
                        {/* <ChipCard title="Sound" icon={<IonIcon icon={MuteSound} color="primary" style={{ fontSize: '28px' }} onClick={() => { handleSubPages("sound") }} />} onClick={() => { handleSubPages("sound") }} /> */}
                        <ChipCard title={<div style={{ display: "flex", alignItems: "center", gap: "10px" }}><IonIcon icon={Profile} style={{ fontSize: '28px' }} /> <p>Edit profile</p></div>} icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '28px' }} onClick={() => { handleSubPages("edit-profile") }} />} onClick={() => { handleSubPages("edit-profile") }}/>
                        {isStudent ? (<ChipCard title={<div style={{ display: "flex", alignItems: "center", gap: "10px" }}><IonIcon icon={HowToPlay} style={{ fontSize: '28px' }} /> <p>How to play</p></div>}
                            icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '28px' }} onClick={() => { handleSubPages("how-to-play") }} />} onClick={() => { handleSubPages("how-to-play") }}/>) :
                            (
                                <ChipCard title={<div style={{ display: "flex", alignItems: "center", gap: "10px" }}><IonIcon icon={CodeLink} style={{ fontSize: '28px' }} /> <p>Code Link</p></div>}
                                    icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '28px' }} onClick={() => { handleSubPages("code-link") }} />} onClick={() => { handleSubPages("code-link") }}/>
                            )
                        }
                        <ChipCard title={<div style={{ display: "flex", alignItems: "center", gap: "10px" }}><IonIcon icon={Help} style={{ fontSize: '28px' }} /> <p>Help</p></div>}
                            icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '28px' }} onClick={() => { handleSubPages("help") }} />} onClick={() => { handleSubPages("help") }} />
                        <ChipCard title={<div style={{ display: "flex", alignItems: "center", gap: "10px" }}><IonIcon icon={PrivacyPolicy} style={{ fontSize: '28px' }} /> <p>Privacy policy</p></div>}
                            icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '28px' }} onClick={() => { handleSubPages("privacy-policy") }} />} onClick={() => { handleSubPages("privacy-policy") }} />
                        <ChipCard title={<div style={{ display: "flex", alignItems: "center", gap: "10px" }}><IonIcon icon={TermsAndConditions} style={{ fontSize: '28px' }} /> <p>Terms and conditions</p></div>}
                            icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '28px' }} onClick={() => { handleSubPages("terms-and-conditions") }} />} onClick={() => { handleSubPages("terms-and-conditions") }} />
                        <ChipCard title={<div style={{ display: "flex", alignItems: "center", gap: "10px" }}><IonIcon icon={Logout} style={{ fontSize: '28px' }} /> <p>Logout</p></div>}
                            icon={<IonIcon icon={RightArrow} id="open-logout-modal" color="primary" style={{ fontSize: '28px' }} onClick={() => { setIsModalOpen(true) }} />} onClick={() => { setIsModalOpen(true) }} />
                    </>
                )
            }
            <CommonPopup isOpen={isModalOpen} setIsOpen={setIsModalOpen} modalRef={logoutModalRef}>
                <CommonCard headerText="Logout">
                    <p style={{ color: "#607E9C", fontSize: "20px", fontWeight: "bold", marginBottom: "20px", marginTop: "0px" }}>Are you sure you want to logout?</p>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                        <CustomButton disable={loadingLogOut} btnText="Cancel" background={"#29B0FF"} txtColor={"white"} style={{ fontSize: "24px" }} onClick={() => handleCloseModal()} />
                        <CustomButton isLoading={loadingLogOut} btnText="Logout" background={"#FF0000"} txtColor={"white"} style={{ fontSize: "24px" }} onClick={() => handleLogOut()} />
                    </div>
                </CommonCard>
            </CommonPopup>

            <CommonPopup isOpen={isClassModalOpen} setIsOpen={setIsClassModalOpen} modalRef={classModalRef}>
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
                                onClick={() => handleCloseClassModal()}
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
                        <CustomButton btnText="Save" background={"#D929FF"} txtColor={"white"} style={{ fontSize: "24px", width: "auto" }} onClick={() => { handleCloseClassModal() }} />
                    </div>
                </CommonCard>
            </CommonPopup>
            <IonToast isOpen={showError} message={errorMessage} duration={2000} onDidDismiss={() => setShowError(false)}></IonToast>
        </div>
        // </IonPage>
    )
}

export default ProfilePage;