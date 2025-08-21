import { IonIcon } from "@ionic/react";
import BackArrow from "../assets/left_arrow.svg"
import { useHistory } from "react-router";
import ChipCard from "../components/common-component/ChipCard";
import View from "../assets/view.svg"
import CustomButton from "../components/common-component/Button";
import PlusButton from "../assets/plus_button.svg"
import SearchInput from "../components/common-component/SearchInput";
import { useState } from "react";

const ClassroomDetailsPage = () => {
    const history = useHistory()
    const [inputValue, setInputValue] = useState("")

    const handleSearch = () => {
        console.log(inputValue)
    }

    return (
        <div style={{
            margin: "6vh 10px 10px 10px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
            maxHeight: "79vh",
            overflowY: "scroll"
        }}>
            <div style={{ width: "100%", borderBottom: "1px solid white", paddingBottom: "10px" }}>
                {/* <div style={{
                    padding: "0px 10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <IonIcon icon={BackArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { history.push("/tabs/classroom") }} />
                    <CustomButton btnText="" style={{ width: "auto" }} icon={<IonIcon icon={Plus} color="#D929FF" style={{ fontSize: '24px' }} onClick={() => { history.push("/tabs/classroom/create") }} />} />
                </div> */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", width: "100%" }}>
                    <IonIcon icon={BackArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { history.push("/tabs/classroom") }} />
                    <SearchInput
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onSearch={handleSearch}
                    />
                    <IonIcon icon={PlusButton} color="#D929FF" style={{ fontSize: '38px' }} onClick={() => { history.push("/tabs/classroom/create") }} />
                </div>
            </div>
            <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "0px 10px" }}>
                    <p style={{ color: "#607E9C", fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>Class 4A</p>
                    <p style={{ color: "#607E9C", fontSize: "16px", fontWeight: "bold", marginBottom: "20px", marginTop: "20px" }}>{12} students</p>
                </div>
                <ChipCard textTransform={true} count={1} title={
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <p style={{ margin: "0px", fontWeight: 600, fontSize: "20px" }}>Animal</p>
                        <p style={{ margin: "0px", fontSize: "16px" }}>20-aug</p>
                    </div>} icon={<IonIcon icon={View} color="primary" style={{ fontSize: '32px' }} onClick={() => { history.push("/tabs/classroom/details") }} />} />
            </>
        </div>
    )
}

export default ClassroomDetailsPage;