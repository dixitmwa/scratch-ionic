import { IonIcon } from "@ionic/react";
import SearchInput from "../components/common-component/SearchInput";
import { useEffect, useState } from "react";
import BackArrow from "../assets/left_arrow.svg";
import { useHistory } from "react-router";
import ChipCard from "../components/common-component/ChipCard";
import View from "../assets/view.svg"
import LeftArrow from "../assets/left_arrow_double.svg";
import PlayArrow from "../assets/play.svg";
import RightArrow from "../assets/right_arrow_double.svg";
import CustomButton from "../components/common-component/Button";

const AssignmentDetailsPage = () => {
    const history = useHistory();
    const [inputValue, setInputValue] = useState("");
    const [assignmentDetails, setAssignmentDetails] = useState([{}, {}]);
    const [showDetails, setShowDetails] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<"correct" | "wrong" | null>(null);
    const handleSearch = (val?: string) => { }

    const fetchAssignmentDetails = async () => { }

    const handleViewDetails = (item: any) => {
        setShowDetails(true);
    }

    const handleAnswerClick = (answer: "correct" | "wrong") => {
        console.log(`User selected: ${answer}`);
        setSelectedAnswer(answer);
    }

    useEffect(() => {
        fetchAssignmentDetails();
    }, [])

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
                    <IonIcon icon={BackArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { showDetails ? setShowDetails(false) : history.push("/tabs/assignment/history") }} />
                    {/* <p style={{ color: "#607E9C", fontSize: "20px", fontWeight: "bold", margin: "0px", textAlign: "center" }}>Create New Assignment</p> */}
                    {
                        showDetails ? (
                            <div>
                                <p style={{ color: "#607E9C", fontSize: "24px", fontWeight: "bold", marginBottom: "0px", marginTop: "0px" }}>Lara Simmons</p>
                                <p style={{ color: "#607E9C", textAlign: "center", fontSize: "18px", marginBottom: "0px", marginTop: "0px" }}>+1 98765 43210</p>
                            </div>
                        ) : (
                            <SearchInput
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onSearch={() => handleSearch()}
                            />
                        )
                    }
                    <div style={{ width: "32px" }}></div>
                </div>
            </div>
            <>
                {
                    !showDetails ? (
                        <>
                            {assignmentDetails.map((item: any, index: number) => (
                                <ChipCard textTransform={true} count={index + 1} title={
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <p style={{ margin: "0px", fontWeight: 600, fontSize: "20px" }}>{item?.title}</p>
                                        <p style={{ margin: "0px", fontSize: "16px" }}>Class : 4A</p>
                                        <p style={{ margin: "0px", fontSize: "16px" }}>12 students submitted</p>
                                    </div>
                                } icon={<IonIcon icon={View} color="primary" style={{ fontSize: '32px' }} onClick={() => { handleViewDetails(item) }} />} />
                            ))}
                        </>
                    ) : (
                        <div style={{
                            background: '#F7FAFF',
                            borderRadius: '20px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            padding: '24px 12px 16px 12px',
                            width: '100%',
                            margin: '0 auto',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}>
                            <CustomButton btnText="" icon={<IonIcon icon={LeftArrow} style={{ fontSize: "25px" }} />} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', width: "60px" }} />
                            <CustomButton btnText="" icon={<IonIcon icon={RightArrow} style={{ fontSize: "25px" }} />} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', width: "60px" }} />
                            <div style={{
                                background: '#fff',
                                borderRadius: '16px',
                                padding: '18px 8px',
                                minHeight: '400px',
                                minWidth: '330px',
                                marginBottom: '18px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                            }}>
                                blocks
                            </div>
                            <CustomButton btnText="" style={{ width: "auto" }}
                                icon={<IonIcon icon={PlayArrow} style={{ fontSize: "25px" }} />}
                            />
                            <div style={{ display: 'flex', gap: "5px", justifyContent: 'space-between', marginTop: '8px' }}>
                                <CustomButton
                                    btnText="wrong"
                                    txtColor={selectedAnswer === "wrong" ? "#FFFFFF" :
                                        "#607E9C"}
                                    background={selectedAnswer === "wrong" ? "#FF297A" : "#FFFFFF"}
                                    style={{
                                        padding: '12px 20px',
                                    }}
                                    onClick={() => { handleAnswerClick("wrong") }}
                                />
                                <CustomButton
                                    btnText="correct"
                                    txtColor={selectedAnswer === "correct" ? "#FFFFFF" : "#607E9C"}
                                    background={selectedAnswer === "correct" ? "#29B0FF" : "#FFFFFF"}
                                    style={{
                                        padding: '12px 20px',
                                    }}
                                    onClick={() => { handleAnswerClick("correct") }}
                                />
                            </div>
                        </div>
                    )
                }
            </>
        </div>
    );
};

export default AssignmentDetailsPage;
