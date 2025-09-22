import { useEffect, useState } from "react";
import CustomButton from "../../components/common-component/Button";
import CommonCard from "../../components/common-component/Card";
import CommonInput from "../../components/common-component/Input";
import { useHistory } from "react-router";
import { IonIcon, IonPage, IonToast, useIonViewDidEnter, useIonViewWillEnter } from "@ionic/react";
import { Preferences } from "@capacitor/preferences";
import Auth from "../../service/AuthService/AuthService";
import Back from "../../assets/double_arrow_left_button.svg"

const LoginWithCode = () => {
    const [code, setCode] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showError, setShowError] = useState(false);
    const history = useHistory();
    const [prefix, setPrefix] = useState("+91")
    const [mobileNumber, setMobileNumber] = useState("");
    const [isMobile, setIsMobile] = useState(true)
    const [email, setEmail] = useState("");
    const [otpSent, setOtpSent] = useState(false)
    const [userType, setUserType] = useState("")

    const loadUserType = async () => {
        const { value } = await Preferences.get({ key: "userType" });
        setUserType(value?.toLowerCase() || "student");
    };

    useIonViewDidEnter(() => {
        loadUserType();
    });

    const handleSentOtp = async () => {
        const reqObj = {
            [isMobile ? 'mobileNumber' : 'email']: isMobile ? prefix + mobileNumber : email,
        }
        const response: any = await Auth.sentOtpService(reqObj)
        debugger
        console.log(response)
        if (response?.status != 200) {
            setShowError(true)
            setErrorMessage(response?.data?.message)
        } else {
            setOtpSent(true)
        }
    }

    const handleLogin = async () => {
        const response: any = await Auth.verifyOtpService({
            [isMobile ? 'mobileNumber' : 'email']: isMobile ? prefix + mobileNumber : email,
            otp: code
        })
        debugger
        console.log(response)
        debugger
        if (response?.status === 200) {
            await Preferences.set({ key: 'credential', value: JSON.stringify({ mobileNumber, email, countryCode: prefix }) })
            history.push("/complete-profile")
        } else {
            // await Preferences.set({ key: 'credential', value: JSON.stringify({ mobileNumber, email }) })
            // history.push("/complete-profile")
            setShowError(true)
            setErrorMessage(response?.data?.message)
        }
    }

    const handleNavigateBack = () => {
        setOtpSent(false)
        setCode("")
        history.push("/login-method");
    }

    useEffect(() => {
        loadUserType();
    }, []);

    return (
        <IonPage>
            <div style={{
                marginTop: "6vh",
                padding: "0px 10px",
                display: "flex",
                justifyContent: "space-around"
            }}>
                <IonIcon icon={Back} color="primary" style={{ fontSize: '32px' }} onClick={() => { handleNavigateBack() }} />
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
                        otpSent ? (
                            <CommonCard headerText="OTP  Verification">
                                <CommonInput
                                    textHeader={`Enter OTP code send to your ${isMobile ? mobileNumber : email}`}
                                    type="number"
                                    value={code}
                                    onChange={(e) => { setCode(e.target.value) }} />
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "10px" }}>
                                    <CustomButton btnText="Verify" background="#D929FF" onClick={handleLogin} style={{ width: "auto" }} disable={code?.length != 6} />
                                </div>
                            </CommonCard>
                        ) : (
                            <CommonCard headerText="Sign Up">
                                <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                                    <CustomButton btnText="Mobile No" background={isMobile ? "#D929FF" : "transparent"} txtColor={isMobile ? "white" : "#607E9C"} style={isMobile ? { fontSize: "16px" } : { fontSize: "16px", border: "1px solid #607E9C" }} onClick={() => setIsMobile(true)} />
                                    <CustomButton btnText="Email Id" background={!isMobile ? "#D929FF" : "transparent"} txtColor={!isMobile ? "white" : "#607E9C"} style={!isMobile ? { fontSize: "16px" } : { fontSize: "16px", border: "1px solid #607E9C" }} onClick={() => setIsMobile(false)} />
                                </div>
                                {
                                    isMobile ? (
                                        <CommonInput
                                            textHeader="Enter your mobile number we will sent you OTP to verify"
                                            type="number"
                                            value={mobileNumber}
                                            prefix={prefix}
                                            showCountryCode={true}
                                            placeholder="Mobile number..."
                                            onCountryCodeChange={(code) => { setPrefix(code) }}
                                            onChange={(e) => { setMobileNumber(e.target.value) }} />
                                    ) : (
                                        <CommonInput
                                            textHeader="Enter your Email-id we will sent you OTP to verify"
                                            type="email"
                                            value={email}
                                            placeholder="Email ID..."
                                            onChange={(e) => { setEmail(e.target.value.toLowerCase()) }} />
                                    )
                                }
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "10px" }}>
                                    <CustomButton btnText="Send otp" background="#D929FF" onClick={handleSentOtp} style={{ width: "auto" }} disable={isMobile ? mobileNumber?.length != 10 : !RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(email)} />
                                </div>
                            </CommonCard>
                        )
                    }
                </div>
            </div>
            <IonToast isOpen={showError} message={errorMessage} duration={2000} onDidDismiss={() => setShowError(false)}></IonToast>
        </IonPage>
    )
}

export default LoginWithCode;