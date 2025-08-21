import { IonIcon } from "@ionic/react";
import BackArrow from "../assets/left_arrow.svg";
import { useHistory } from "react-router";
import ChipCard from "../components/common-component/ChipCard";
import RightArrow from "../assets/right_arrow.svg";
import { useState } from "react";
import SearchInput from "../components/common-component/SearchInput";

const AssignmentUpcomingPage = () => {
    const history = useHistory()
    const [assignmentList, setAssignmentList] = useState([{}, {}, {}])
    const [inputValue, setInputValue] = useState("");
    const handleSearch = ()=>{

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
                <div style={{
                    padding: "0px 10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <IonIcon icon={BackArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { history.push("/tabs/assignment") }} />
                    {/* <p style={{ color: "#607E9C", fontSize: "20px", fontWeight: "bold", margin: "0px", textAlign: "center" }}>Create New Assignment</p> */}
                    <SearchInput
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onSearch={handleSearch}
                    />
                    <div style={{ width: "32px" }}></div>
                </div>
            </div>
            <>
                {
                    assignmentList.map((item, index) => {
                        return (
                            <ChipCard textTransform={true} count={index + 1} title={
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <p style={{ margin: "0px", fontWeight: 600, fontSize: "20px" }}>Animal</p>
                                    <p style={{ margin: "0px", fontSize: "16px" }}>Class : 4A</p>
                                    <p style={{ margin: "0px", fontSize: "16px" }}>12 students submitted</p>
                                </div>} icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { history.push("/tabs/classroom/details") }} />} />
                        )
                    })
                }
                {/* <ChipCard textTransform={true} count={2}
                    title={
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <p style={{ margin: "0px", fontWeight: 600, fontSize: "20px" }}>Environment</p>
                            <p style={{ margin: "0px", fontSize: "16px" }}>Class : 4A</p>
                            <p style={{ margin: "0px", fontSize: "16px" }}>12 students submitted</p>
                        </div>
                    } icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { history.push("/tabs/classroom/details") }} />} /> */}
            </>
        </div>
    )
}

export default AssignmentUpcomingPage;