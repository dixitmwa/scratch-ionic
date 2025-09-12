import { useHistory } from "react-router";
import CustomButton from "../../components/common-component/Button";
import { IonIcon, IonPage, useIonViewWillEnter } from "@ionic/react";
import Back from "../../assets/double_arrow_left_button.svg"
import { Preferences } from "@capacitor/preferences";
import { useState } from "react";

const LoginMethodPreference = () => {
    const history = useHistory();
    const [userType, setUserType] = useState("")

    const loadUserType = async () => {
        const { value } = await Preferences.get({ key: "userType" });
        setUserType(value?.toLowerCase() || "student");
    };

    useIonViewWillEnter(() => {
        loadUserType();
    });

    return (
        <IonPage>
            <div>
                <div style={{
                    marginTop: "6vh",
                    padding: "0px 10px",
                    display: "flex",
                    justifyContent: "space-around"
                }}>
                    <IonIcon icon={Back} color="primary" style={{ fontSize: '32px' }} onClick={() => { history.push("/") }} />
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
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "space-around",
                        height: "90vh",
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
                        <CustomButton btnText="Login" background="#FF8D29" txtColor="white" onClick={() => { history.push("/sign-in") }} />
                        <CustomButton btnText="Sign up" background="#D929FF" txtColor="white" onClick={() => { history.push("/sign-up") }} />
                    </div>
                </div>
            </div>
        </IonPage>
    )
}

export default LoginMethodPreference;