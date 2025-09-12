import { IonIcon, isPlatform } from "@ionic/react";
import CommonCard from "../components/common-component/Card";
import CreateNew from "../assets/create_new.svg"
import Upcoming from "../assets/upcoming.svg"
import History from "../assets/history.svg"
import { useHistory } from "react-router";

const AssignmentPage = () => {
    const history = useHistory()
    return (
        <div style={{
            margin: "6vh 10px 10px 10px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
            maxHeight: isPlatform('ios') ? "79vh": "85vh",
            overflowY: "scroll"
        }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gridTemplateRows: "repeat(2,1fr)", gap: "10px" }}>
                <CommonCard style={{ padding: "10px" }} onClick={() => history.push("/tabs/assignment/create")}>
                    <img src={CreateNew} alt="" />
                    <p style={{ color: "#607E9C", fontSize: "20px", fontWeight: "bold", margin: "0px", textAlign: "center" }}>Create New</p>
                </CommonCard>
                <CommonCard style={{ padding: "10px" }} onClick={() => history.push("/tabs/assignment/upcoming")}>
                    <img src={Upcoming} alt="" />
                    <p style={{ color: "#607E9C", fontSize: "20px", fontWeight: "bold", margin: "0px", textAlign: "center" }}>Upcoming</p>
                </CommonCard>
                <CommonCard style={{ padding: "10px" }} onClick={() => history.push("/tabs/assignment/history")}>
                    <img src={History} alt="" />
                    <p style={{ color: "#607E9C", fontSize: "20px", fontWeight: "bold", margin: "0px", textAlign: "center" }}>History</p>
                </CommonCard>
            </div>
        </div>
    )
}

export default AssignmentPage;