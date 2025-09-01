import { useState } from "react"
import CustomButton from "../../components/common-component/Button"
import CommonCard from "../../components/common-component/Card"
import CommonInput from "../../components/common-component/Input"
import { useHistory } from "react-router"
import { Link } from "react-router-dom"
import { Preferences } from "@capacitor/preferences"
import { IonIcon, IonPage, IonToast, useIonRouter, useIonViewDidLeave, useIonViewWillEnter } from "@ionic/react"
import Back from "../../assets/double_arrow_left_button.svg"
import AuthService from "../../service/AuthService/AuthService"

const LoginWithMobile = () => {
    const history = useHistory();
    const router = useIonRouter()
    const [mobileNumber, setMobileNumber] = useState("");
    const [prefix, setPrefix] = useState("+91")
    const [isMobile, setIsMobile] = useState(true)
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showMessage, setShowMessage] = useState(false)
    const [messageDetails, setMessageDetails] = useState("")
    const [userType, setUserType] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const loadUserType = async () => {
        const { value } = await Preferences.get({ key: "userType" });
        setUserType(value?.toLowerCase() || "student");
    };

    useIonViewWillEnter(() => {
        loadUserType();
    });

    console.log("-------inside------")

    const sentOtp = () => {
        console.log("Send OTP", mobileNumber)
        const isValid = /^[6-9]\d{9}$/.test(mobileNumber);
        if (!isValid) {
            alert("Please enter a valid 10-digit mobile number.");
            return;
        }
        history.push("/tabs/editor")
    }

    const verifyOtp = async () => {
        setIsLoading(true)
        const reqObj = {
            [isMobile ? 'mobileNumber' : 'email']: isMobile ? prefix + mobileNumber : email,
            password: password
        }
        console.log(reqObj)
        const response: any = await AuthService.loginWithCodeService(reqObj)
        console.log(response)
        debugger
        if (response?.status != 200) {
            setShowMessage(true)
            setMessageDetails(response?.data?.message)
        } else {
            await Preferences.set({ key: 'auth', value: response?.data?.data?.token })
            await Preferences.set({ key: 'userType', value: response?.data?.data?.role?.toLowerCase() })
            setTimeout(() => {
                // router.push("/login-method", "forward");
                history.push("/tabs/editor")
            }, 0)
        }
        setIsLoading(false)
    }

    useIonViewDidLeave(() => {
        setEmail("")
        setPassword("")
    })

    return (
        <>
            <div>
                <div style={{
                    marginTop: "6vh",
                    padding: "0px 10px",
                    display: "flex",
                    justifyContent: "space-around"
                }}>
                    <IonIcon icon={Back} color="primary" style={{ fontSize: '32px' }} onClick={() => { history.push("/login-method") }} />
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
                {/* <IonPage> */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "90vh", width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", width: "100%", maxWidth: "360px" }}>
                        <CommonCard headerText={"Login"}>
                            <p style={{ color: "#607E9C", fontSize: "20px", fontWeight: "bold", marginBottom: "20px", marginTop: "0px" }}>Mobile number OR Email Id to Login</p>
                            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                                <CustomButton btnText="Mobile No" background={isMobile ? "#D929FF" : "transparent"} txtColor={isMobile ? "white" : "#607E9C"} style={isMobile ? { fontSize: "16px" } : { fontSize: "16px", border: "1px solid #607E9C" }} onClick={() => setIsMobile(true)} />
                                <CustomButton btnText="Email Id" background={!isMobile ? "#D929FF" : "transparent"} txtColor={!isMobile ? "white" : "#607E9C"} style={!isMobile ? { fontSize: "16px" } : { fontSize: "16px", border: "1px solid #607E9C" }} onClick={() => setIsMobile(false)} />
                            </div>
                            {
                                isMobile ? (
                                    <CommonInput
                                        // textHeader="Enter your mobile number we will sent you OTP to verify"
                                        type="number"
                                        value={mobileNumber}
                                        prefix={prefix}
                                        showCountryCode={true}
                                        placeholder="Mobile number..."
                                        onCountryCodeChange={(code) => { setPrefix(code) }}
                                        onChange={(e) => { setMobileNumber(e.target.value) }} />) :
                                    (<CommonInput
                                        // textHeader="Enter your mobile number we will sent you OTP to verify"
                                        type="email"
                                        value={email}
                                        placeholder="Email ID..."
                                        onChange={(e) => { setEmail(e.target.value.toLowerCase()) }} />)
                            }
                            <CommonInput
                                type="password"
                                value={password}
                                placeholder="Password"
                                onChange={(e) => { setPassword(e.target.value) }} />
                            <div style={{ textAlign: "end", margin: "10px 0px" }}>
                                <Link to={"/forgot-password"} style={{ textDecoration: "none", color: "#1275AF" }}>Forgot Password?</Link>
                            </div>
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "10px" }}>
                                <CustomButton btnText="Login" isLoading={isLoading} style={{ width: "auto" }} disable={isMobile ? (!/^[6-9]\d{9}$/.test(mobileNumber) || password.length < 8) : (!RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(email) || !password)} background="#D929FF" txtColor="white" onClick={() => verifyOtp()} />
                            </div>
                        </CommonCard>
                    </div>
                </div>
                <IonToast isOpen={showMessage} message={messageDetails} duration={2000} onDidDismiss={() => setShowMessage(false)}></IonToast>
                {/* </IonPage> */}
            </div>
        </>
    )
}

export default LoginWithMobile;