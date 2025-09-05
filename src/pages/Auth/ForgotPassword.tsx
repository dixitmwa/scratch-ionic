import { useEffect, useState } from "react";
import CustomButton from "../../components/common-component/Button";
import CommonCard from "../../components/common-component/Card";
import CommonInput from "../../components/common-component/Input";
import { useHistory } from "react-router"
import Back from "../../assets/double_arrow_left_button.svg"
import { IonIcon, IonToast, useIonViewWillEnter } from "@ionic/react"
import { Preferences } from "@capacitor/preferences";
import AuthService from "../../service/AuthService/AuthService";

const ForgotPassword = () => {
    const history = useHistory()
    const [isMobile, setIsMobile] = useState(true)
    const [mobileNumber, setMobileNumber] = useState("");
    const [prefix, setPrefix] = useState("+91")
    const [email, setEmail] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [code, setCode] = useState("");
    const [otpVerified, setOtpVerified] = useState(false)
    const [password, setPassword] = useState({
        password: "",
        confirmPassword: ""
    })
    const [userType, setUserType] = useState("")
    const [showError, setShowError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const loadUserType = async () => {
        const { value } = await Preferences.get({ key: "userType" });
        setUserType(value?.toLowerCase() || "student");
    };

    useIonViewWillEnter(() => {
        loadUserType();
    });

    const fetchInitPage = async () => {
        //     await Preferences.set({ key: "initPage", value: "accept-code" })
    }

    useEffect(() => {
        fetchInitPage()
    }, [])

    const handleSentOtp = async () => {
        const response = await AuthService.sentOtpService({
            [isMobile ? 'mobileNumber' : 'email']: isMobile ? prefix + mobileNumber : email,
        })
        if (response?.status != 200) {
            setShowError(true)
            setErrorMessage(response?.data?.message)
        } else {
            setShowError(true)
            setErrorMessage(response?.data?.message)
            setOtpSent(true)
        }
    }

    const verifyOtp = async () => {
        const response: any = await AuthService.verifyOtpService({
            [isMobile ? 'mobileNumber' : 'email']: isMobile ? prefix + mobileNumber : email,
            otp: code
        })
        console.log(isMobile ? mobileNumber : email, response)
        if (response?.status === 200) {
            setShowError(true)
            setErrorMessage(response?.data?.message)
            setOtpVerified(true)
        } else {
            setShowError(true)
            setErrorMessage(response?.data?.message)
        }
        // console.log("OTP", otp)
        // history.push("/tabs/editor")
    }

    const handlePasswordChanged = async () => {
        const reqObj = {
            password: password.password,
            emailOrPhone: mobileNumber || email
        }
        const response = await AuthService.forgotPasswordService({
            [isMobile ? 'mobileNumber' : 'email']: isMobile ? prefix + mobileNumber : email,
            newPassword: password.password
        })
        if (response?.status === 200) {
            setShowError(true)
            setErrorMessage(response?.data?.message)
            setOtpSent(false)
            setOtpVerified(false)
            history.push("/")
        } else {
            setShowError(true)
            setErrorMessage(response?.data?.message)
        }
        // console.log(password, reqObj)
    }

    return (
        <>
            <div style={{
                marginTop: "6vh",
                padding: "0px 10px",
                display: "flex",
                justifyContent: "space-around"
            }}>
                <IonIcon icon={Back} color="primary" style={{ fontSize: '32px' }} onClick={() => { history.push("/sign-in") }} />
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
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", width: "100%", maxWidth: "360px" }}>
                    {
                        otpSent ? !otpVerified ? (
                            <CommonCard headerText={"Forgot Your Password?"}>
                                <CommonInput
                                    textHeader={`Enter OTP code send to your ${isMobile ? mobileNumber : email}`}
                                    type="number"
                                    value={code}
                                    onChange={(e) => { setCode(e.target.value) }} />
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "10px" }}>
                                    <CustomButton btnText="Continue" background="#D929FF" onClick={verifyOtp} style={{ width: "auto" }} disable={code?.length != 6} />
                                </div>
                            </CommonCard>
                        ) : (
                            <CommonCard headerText={"Forgot Your Password?"}>
                                <p style={{ color: "#607E9C", fontSize: "20px", fontWeight: "bold", marginBottom: "20px", marginTop: "0px" }}>Mobile number OR Email Id to Login</p>
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
                                    <CustomButton btnText="Change Password" background="#D929FF" onClick={() => { handlePasswordChanged() }} style={{ width: "auto" }} disable={(!password.password || !password.confirmPassword) || password.confirmPassword !== password.password} />
                                </div>
                            </CommonCard>
                        ) : (
                            <CommonCard headerText={"Forgot Your Password?"}>
                                <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                                    <CustomButton btnText="Mobile No" background={isMobile ? "#D929FF" : "transparent"} txtColor={isMobile ? "white" : "#607E9C"} style={isMobile ? { fontSize: "16px" } : { fontSize: "16px", border: "1px solid #607E9C" }} onClick={() => setIsMobile(true)} />
                                    <CustomButton btnText="Email Id" background={!isMobile ? "#D929FF" : "transparent"} txtColor={!isMobile ? "white" : "#607E9C"} style={!isMobile ? { fontSize: "16px" } : { fontSize: "16px", border: "1px solid #607E9C" }} onClick={() => setIsMobile(false)} />
                                </div>
                                {
                                    isMobile ? (
                                        <CommonInput
                                            textHeader="No worries! Enter your Mobile No and we'll send you a OTP to reset it."
                                            type="number"
                                            value={mobileNumber}
                                            prefix={prefix}
                                            showCountryCode={true}
                                            placeholder="Mobile number..."
                                            onCountryCodeChange={(code) => { setPrefix(code) }}
                                            onChange={(e) => { setMobileNumber(e.target.value) }} />)
                                        : (
                                            <CommonInput
                                                textHeader="No worries! Enter your email below, and we'll send you a OTP to reset it."
                                                type="email"
                                                value={email}
                                                placeholder="Email ID..."
                                                onChange={(e) => { setEmail(e.target.value.toLowerCase()) }} />
                                        )
                                }
                                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "10px" }}>
                                    <CustomButton btnText="Sent otp" style={{ width: "auto" }} disable={isMobile ? (!/^[6-9]\d{9}$/.test(mobileNumber)) : (!RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(email))} background="#D929FF" txtColor="white" onClick={() => handleSentOtp()} />
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

export default ForgotPassword;