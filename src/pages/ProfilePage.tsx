import { IonIcon, IonModal, IonPage, useIonViewDidLeave } from "@ionic/react";
import ChipCard from "../components/common-component/ChipCard";
import { arrowForwardOutline, volumeLowOutline, exitOutline, helpOutline, bookOutline, documentTextOutline, logOutOutline } from "ionicons/icons";
import { profileConstant } from "../constant/Constant";
import { useRef, useState } from "react";
import CommonModal from "../components/common-component/Modal";
import MuteSound from "../assets/sound_mute.svg"
import UnMuteSound from "../assets/sound_unmute.svg"
import RightArrow from "../assets/right_arrow.svg"
import HowToPlay from "../assets/howtoplay.svg"
import Help from "../assets/help.svg"
import PrivacyPolicy from "../assets/privacypolicy.svg"
import TermsAndConditions from "../assets/termandcondition.svg"
import Logout from "../assets/logout.svg"
import CommonPopup from "../components/common-component/Popup";
import CustomButton from "../components/common-component/Button";
import { Preferences } from "@capacitor/preferences";
import CommonCard from "../components/common-component/Card";
import { useHistory } from "react-router";

const ProfilePage = () => {
    const history = useHistory()
    const modal = useRef<HTMLIonModalElement>(null);
    const [constantData, setConstantData] = useState(profileConstant);
    const [selectedData, setSelectedData] = useState<any>(null);
    const logoutModalRef = useRef<HTMLIonModalElement>(null);

    const handleSubPages = (pageName: string) => {
        console.log(pageName)
        const data = constantData.find((item) => item.route === pageName)
        if (data) {
            setSelectedData(data)
        }
    }

    const handleCloseModal = () => {
        logoutModalRef.current?.dismiss();
    }

    const handleLogOut = async () => {
        await Preferences.set({ key: 'test', value: '123' });
const value = await Preferences.get({ key: 'test' });
console.log("Before clear:", value); // should show 123

await Preferences.clear();

const clearedValue = await Preferences.get({ key: 'test' });
console.log("After clear:", clearedValue); // should be null or empty
        console.log("Cleared Preferences")
        await Preferences.clear()
        const clearedValue1 = await Preferences.get({ key: 'auth' });
        console.log("After clear11:", clearedValue1);
        logoutModalRef.current?.dismiss();
        history.push('/login')
    }

    const handleBack = () => {
        setSelectedData(null)
    }

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
                selectedData ? (<CommonModal title={selectedData.title} description={selectedData.description} onClick={() => handleBack()} />) : (
                    <>
                        <ChipCard title="Sound" icon={<IonIcon icon={MuteSound} color="primary" style={{ fontSize: '28px' }} onClick={() => { handleSubPages("sound") }} />} />
                        <ChipCard title={<div style={{ display: "flex", alignItems: "center", gap: "10px" }}><IonIcon icon={HowToPlay} style={{ fontSize: '28px' }} /> <p>How to play</p></div>}
                            icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '28px' }} onClick={() => { handleSubPages("how-to-play") }} />} />
                        <ChipCard title={<div style={{ display: "flex", alignItems: "center", gap: "10px" }}><IonIcon icon={Help} style={{ fontSize: '28px' }} /> <p>Help</p></div>}
                            icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '28px' }} onClick={() => { handleSubPages("help") }} />} />
                        <ChipCard title={<div style={{ display: "flex", alignItems: "center", gap: "10px" }}><IonIcon icon={PrivacyPolicy} style={{ fontSize: '28px' }} /> <p>Privacy policy</p></div>}
                            icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '28px' }} onClick={() => { handleSubPages("privacy-policy") }} />} />
                        <ChipCard title={<div style={{ display: "flex", alignItems: "center", gap: "10px" }}><IonIcon icon={TermsAndConditions} style={{ fontSize: '28px' }} /> <p>Terms and conditions</p></div>}
                            icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '28px' }} onClick={() => { handleSubPages("terms-and-conditions") }} />} />
                        <ChipCard title={<div style={{ display: "flex", alignItems: "center", gap: "10px" }}><IonIcon icon={Logout} style={{ fontSize: '28px' }} /> <p>Logout</p></div>}
                            icon={<IonIcon icon={RightArrow} id="open-logout-modal" color="primary" style={{ fontSize: '28px' }} onClick={() => { handleSubPages("logout") }} />} />
                    </>
                )
            }
            <CommonPopup trigger="open-logout-modal" modalRef={logoutModalRef}>
                <CommonCard headerText="Logout">
                    <p style={{ color: "#607E9C", fontSize: "20px", fontWeight: "bold", marginBottom: "20px", marginTop: "0px" }}>Are you sure you want to logout?</p>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                        <CustomButton btnText="Cancel" background={"#29B0FF"} txtColor={"white"} style={{ fontSize: "24px" }} onClick={() => handleCloseModal()} />
                        <CustomButton btnText="Logout" background={"#FF0000"} txtColor={"white"} style={{ fontSize: "24px" }} onClick={() => handleLogOut()} />
                    </div>
                </CommonCard>
            </CommonPopup>
        </div>
        // </IonPage>
    )
}

export default ProfilePage;