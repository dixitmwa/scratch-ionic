import { useHistory } from "react-router";
import CustomButton from "../../components/common-component/Button";
import { IonPage } from "@ionic/react";
import { Preferences } from "@capacitor/preferences";

const LoginPreference = () => {
    const history = useHistory();

    const handlePreference = async (type: string) => {
        await Preferences.set({ key: 'userType', value: type })
        history.push('/login-method')
    }

    return (
        <IonPage>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-around",
                    height: "100vh",
                    width: "100%"
                }}>
                <div
                    style={{
                        fontSize: "54px",
                        fontWeight: "bold",
                        backgroundColor: "#FCE482",
                        padding: "16px 24px",
                        borderRadius: "20px",
                        color: "#C1802C",
                        textAlign: "center"
                    }}>KODOMO</div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        width: "100%",
                        maxWidth: "280px",
                        alignItems: "center"
                    }}>
                    <CustomButton btnText="Student" background="#29B0FF" txtColor="white" onClick={() => { handlePreference("student") }} />
                    <CustomButton btnText="Teacher" background="#FBCC13" txtColor="#B57121" onClick={() => { handlePreference("teacher") }} />
                </div>
            </div>
        </IonPage>
    )
}

export default LoginPreference;