import { useState } from "react";
import CommonCard from "../../components/common-component/Card";
import CommonInput from "../../components/common-component/Input";
import CustomButton from "../../components/common-component/Button";
import CustomDropdown from "../../components/common-component/DropDown";
import { useHistory } from "react-router";
import Back from "../../assets/double_arrow_left_button.svg"
import { IonIcon, useIonViewWillEnter } from "@ionic/react";
import { Preferences } from "@capacitor/preferences";

const CompleteProfile = () => {
    const history = useHistory()
    const [isCompleteProfile, setIsCompleteProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        name: "",
        school: "",
        className: "",
        section: ""
    })
    const [password, setPassword] = useState({
        password: "",
        confirmPassword: ""
    })
    const [userType, setUserType] = useState("")

    const loadUserType = async () => {
        const { value } = await Preferences.get({ key: "userType" });
        setUserType(value || "student");
    };

    useIonViewWillEnter(() => {
        loadUserType();
    });

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
                                            value={profileData.school}
                                            onChange={(val: any) => setProfileData({ ...profileData, school: val })}
                                            options={[
                                                "The Doon School, Dehradun",
                                                "The Scindia School, Gwalior",
                                                "Mayo College, Ajmer",
                                                "Woodstock School, Mussoorie",
                                                "The Lawrence School, Sanawar",
                                                "Dhirubhai Ambani International School, Mumbai",
                                                "Welham Girls' School, Dehradun"
                                            ]} />
                                    </div>
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <CustomDropdown
                                            textHeader="Class"
                                            value={profileData.className}
                                            onChange={(val: any) => setProfileData({ ...profileData, className: val })}
                                            options={[
                                                "5th",
                                                "6th",
                                                "7th",
                                                "8th",
                                                "9th",
                                                "10th",
                                                "11th",
                                                "12th"
                                            ]}
                                        />
                                        <CustomDropdown
                                            textHeader="Section"
                                            value={profileData.section}
                                            onChange={(val: any) => setProfileData({ ...profileData, section: val })}
                                            options={[
                                                "A",
                                                "B",
                                                "C",
                                                "D",
                                            ]}
                                        />
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "10px" }}>
                                        <CustomButton btnText="Continue" background="#D929FF" onClick={() => { setIsCompleteProfile(true) }} style={{ width: "auto" }} disable={!profileData.name || !profileData.school || !profileData.className || !profileData.section} />
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
                                    <CustomButton btnText="Submit" background="#D929FF" onClick={() => { history.push("/accept-code") }} style={{ width: "auto" }} disable={(!password.password || !password.confirmPassword) || password.confirmPassword !== password.password} />
                                </div>
                            </CommonCard>
                        )
                    }
                </div>
            </div>
        </>
    )
}

export default CompleteProfile;