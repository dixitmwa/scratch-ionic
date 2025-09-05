import { useEffect, useState } from "react";
import CommonCard from "../../components/common-component/Card";
import CommonInput from "../../components/common-component/Input";
import CustomButton from "../../components/common-component/Button";
import CustomDropdown from "../../components/common-component/DropDown";
import { useHistory } from "react-router";
import Back from "../../assets/double_arrow_left_button.svg"
import { IonIcon, IonToast, useIonViewWillEnter } from "@ionic/react";
import { Preferences } from "@capacitor/preferences";
import AuthService from "../../service/AuthService/AuthService";

const CompleteProfile = () => {
    const history = useHistory()
    const [isCompleteProfile, setIsCompleteProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        name: "",
        schoolId: "",
        classId: "",
        sectionId: ""
    })
    const [schoolOptions, setSchoolOptions] = useState<any[]>([]);
    const [classOptions, setClassOptions] = useState<any[]>([]);
    const [sectionOptions, setSectionOptions] = useState<any[]>([]);
    const [password, setPassword] = useState({
        password: "",
        confirmPassword: ""
    })
    const [userType, setUserType] = useState("")
    const [showError, setShowError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const loadUserType = async () => {
        const { value } = await Preferences.get({ key: "userType" });
        setUserType(value || "student");
    };

    console.log('profileData', profileData)

    const handleUpdateProfile = async () => {
        debugger
        const { value } = await Preferences.get({ key: "credential" })
        const { value: userType } = await Preferences.get({ key: "userType" })
        // const credentialValue = JSON.parse(value || "")
        const response = await AuthService.registerService({
            name: profileData.name,
            schoolName: profileData.schoolId,
            className: profileData.classId,
            sectionName: profileData.sectionId,
            role: userType,
            mobileNumber: "7990465461",
            countryCode: "+91",
            // ...credentialValue,
            password: password.password
        })
        debugger
        console.log(response)
        if (response?.status === 200) {
            setShowError(true)
            setErrorMessage(response?.data?.message)
            await Preferences.set({ key: "initPage", value: "accept-code" })
            history.push("/accept-code")
        } else {
            setShowError(true)
            setErrorMessage(response?.data?.message)
        }
    }

    const fetchSchoolWiseClasses = async () => {
        const response = await AuthService.fetchSchoolWiseClassesService();
        if (response?.status === 200) {
            const data = response?.data?.data;
            // If API returns array of schools
            if (Array.isArray(data)) {
                setSchoolOptions(data.map((school: any) => ({
                    label: school.schoolName,
                    value: school.schoolId,
                    classes: school.classes
                })));
            } else if (data?.schoolName) {
                // If API returns a single school object
                setSchoolOptions([{ label: data.schoolName, value: data.schoolId, classes: data.classes }]);
            }
        }
    }

    useIonViewWillEnter(() => {
        loadUserType();
        fetchSchoolWiseClasses();
    });

    useEffect(() => {
        fetchSchoolWiseClasses()
    }, [])

    return (
        <>
            <div style={{
                marginTop: "6vh",
                padding: "0px 10px",
                display: "flex",
                justifyContent: "space-around"
            }}>
                <IonIcon icon={Back} color="primary" style={{ fontSize: '32px' }} onClick={() => { history.push("/sign-up") }} />
                <p
                    style={{
                        fontSize: "24px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        color: "#607E9C",
                        textAlign: "center",
                        marginTop: "0px",
                        marginBottom: "0px"
                    }}
                >
                    Welcome {userType}
                </p>
                <div style={{ width: "32px" }}></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "90vh", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", width: "95%", maxWidth: "380px" }}>
                    {
                        !isCompleteProfile ? (
                            <CommonCard headerText="What’s your details">
                                <p style={{ color: "#607E9C", fontSize: "20px", fontWeight: "bold", marginBottom: "20px", marginTop: "0px" }}>Your official details important to create an account</p>
                                <div>
                                    <CommonInput
                                        textHeader="Name"
                                        type="text"
                                        value={profileData.name}
                                        placeholder="Enter Name"
                                        onChange={(e) => { setProfileData({ ...profileData, name: e.target.value }) }} />
                                    <div style={{ marginTop: "10px" }}>
                                        <CustomDropdown
                                            textHeader="School"
                                            value={profileData.schoolId}
                                            onChange={(option: any) => {
                                                setProfileData({ ...profileData, schoolId: option.value, classId: '', sectionId: '' });
                                                // Set class options for selected school
                                                const selectedSchool = schoolOptions.find(s => s.value === option.value);
                                                setClassOptions(selectedSchool?.classes?.map((cls: any) => ({
                                                    label: `${cls.className} (${cls.classNumber})`,
                                                    value: cls.classId,
                                                    sections: cls.sections
                                                })) || []);
                                                setSectionOptions([]);
                                            }}
                                            options={schoolOptions}
                                            isSearchable={true}
                                        />
                                    </div>
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <CustomDropdown
                                            textHeader="Class"
                                            value={profileData.classId}
                                            onChange={(option: any) => {
                                                setProfileData({ ...profileData, classId: option.value, sectionId: '' });
                                                // Set section options for selected class
                                                const selectedClass = classOptions.find(c => c.value === option.value);
                                                setSectionOptions(selectedClass?.sections?.map((sec: any) => ({
                                                    label: sec.sectionName,
                                                    value: sec.sectionId
                                                })) || []);
                                            }}
                                            options={classOptions}
                                            isSearchable={true}
                                            disabled={!profileData.schoolId}
                                        />
                                        <CustomDropdown
                                            textHeader="Section"
                                            value={profileData.sectionId}
                                            onChange={(option: any) => setProfileData({ ...profileData, sectionId: option.value })}
                                            options={sectionOptions}
                                            isSearchable={true}
                                            disabled={!profileData.classId}
                                        />
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "10px" }}>
                                        <CustomButton btnText="Continue" background="#D929FF" onClick={() => { setIsCompleteProfile(true) }} style={{ width: "auto" }} disable={!profileData.name || !profileData.schoolId || !profileData.classId || !profileData.sectionId} />
                                    </div>
                                </div>
                            </CommonCard>
                        ) : (
                            <CommonCard headerText="Create Your New Password">
                                <p style={{ color: "#607E9C", fontSize: "20px", fontWeight: "bold", marginBottom: "20px", marginTop: "0px" }}>Choose a strong, unique password.</p>
                                <CommonInput
                                    textHeader="New Password"
                                    type="password"
                                    value={password.password}
                                    placeholder="Enter New Password"
                                    onChange={(e) => { setPassword({ ...password, password: e.target.value }) }} />
                                <CommonInput
                                    textHeader="Confirm New Password"
                                    type="password"
                                    value={password.confirmPassword}
                                    placeholder="Enter Confirm New Password"
                                    onChange={(e) => { setPassword({ ...password, confirmPassword: e.target.value }) }} />
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "10px" }}>
                                    <CustomButton btnText="Submit" background="#D929FF" onClick={() => { handleUpdateProfile() }} style={{ width: "auto" }} disable={(!password.password || !password.confirmPassword) || password.confirmPassword !== password.password} />
                                </div>
                            </CommonCard>
                        )
                    }
                </div>
            </div>
            <IonToast isOpen={showError} message={errorMessage} duration={2000} onDidDismiss={() => setShowError(false)}></IonToast>
        </>
    )
}

export default CompleteProfile;