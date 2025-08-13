import { useState } from "react"
import CustomButton from "../../components/common-component/Button"
import CommonCard from "../../components/common-component/Card"
import CommonInput from "../../components/common-component/Input"
import { useHistory } from "react-router"
import { Preferences } from "@capacitor/preferences"
import Back from "../../assets/double_arrow_left_button.svg"
import { IonIcon, useIonViewWillEnter } from "@ionic/react"

const AcceptCode = () => {
    const history = useHistory()
    const [codeId, setCodeId] = useState("")
    const [userType, setUserType] = useState("")

    const loadUserType = async () => {
        const { value } = await Preferences.get({ key: "userType" });
        setUserType(value || "student");
    };

    useIonViewWillEnter(() => {
        loadUserType();
    });

    const handleSubmitCode = async () => {
        await Preferences.set({ key: 'auth', value: "loremtokengeneratedbyautomanual" })
        history.push("/tabs/editor")
    }

    return (
        <>
            <div style={{
                marginTop: "6vh",
                padding: "0px 10px",
                display: "flex",
                justifyContent: "space-around"
            }}>
                <IonIcon icon={Back} color="primary" style={{ fontSize: '32px' }} onClick={() => { history.push("/complete-profile") }} />
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
                    <CommonCard headerText="Code / ID submit">
                        <p style={{ color: "#607E9C", fontSize: "20px", fontWeight: "bold", marginBottom: "20px", marginTop: "0px" }}>Your official details important to create an account</p>
                        <CommonInput
                            textHeader="Code Link / Product ID"
                            type="text"
                            value={codeId}
                            placeholder="Enter Code Link / Product ID"
                            onChange={(e: any) => { setCodeId(e.target.value) }}
                        />
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "10px" }}>
                            <CustomButton btnText="Submit" background="#FF8D29" onClick={() => { handleSubmitCode() }} style={{ width: "auto" }} disable={codeId.length !== 4} />
                        </div>
                    </CommonCard>
                </div>
            </div>
        </>
    )
}

export default AcceptCode;