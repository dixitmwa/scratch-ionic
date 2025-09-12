import { IonIcon, isPlatform, useIonViewDidEnter } from "@ionic/react"
import BackArrow from "../assets/left_arrow.svg"
import { useHistory } from "react-router"
import ChipCard from "../components/common-component/ChipCard"
import View from '../assets/view.svg'
import CodeLinkService from "../service/CodeLinkService/CodeLinkService"
import { useEffect, useState } from "react"
import CommonModal from "../components/common-component/Modal"
import CustomButton from "../components/common-component/Button"
import Radio from "../assets/radio.svg"
import CommonInput from "../components/common-component/Input"
import { Clipboard } from "@capacitor/clipboard"

const CodeHistoryPage = () => {
    const history = useHistory();
    const [listOfCodeHistory, setListOfCodeHistory] = useState([])
    const [details, setDetails] = useState<any>({})
    const [openHistoryModal, setOpenHistoryModal] = useState(false)

    const fetchCodeHistory = async () => {
        const response = await CodeLinkService.fetchCodeHistoryService();
        if (response?.status === 200) {
            setListOfCodeHistory(response?.data?.data)
        }
    }

    console.log(details)

    const handleOpenDetails = (index: number) => {
        setDetails(listOfCodeHistory[index] || {})
        setOpenHistoryModal(true)
    }

    const copyTextToClipboard = async (text) => {
        try {
            await Clipboard.write({
                string: text
            });
            console.log('Text copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy text:', error);
        }
    };

    useEffect(() => {
        fetchCodeHistory()
    }, [])

    return (
        <div className="project-details-content" style={{
            margin: "6vh 0px 10px 0px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
            maxHeight: isPlatform('ios') ? "79vh": "85vh",
            // overflowY: "scroll",
        }}>
            {
                !openHistoryModal ? (
                    <>
                        <div className="header" style={{ width: "100%", borderBottom: "1px solid white", paddingBottom: "10px" }}>
                            <div style={{
                                padding: "0px 10px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}>
                                <IonIcon icon={BackArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { history.push("/tabs/profile") }} />
                                <div>
                                    <p style={{
                                        fontSize: "24px",
                                        fontWeight: 600,
                                        textTransform: "uppercase",
                                        color: "#607E9C",
                                        textAlign: "center",
                                        marginTop: "0px",
                                        marginBottom: "0px"
                                    }}>
                                        Code History
                                    </p>
                                </div>
                                <div style={{ width: "32px" }}></div>
                            </div>
                        </div>

                        <div style={{
                            margin: "0px 10px 10px 10px",
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                            justifyContent: "center",
                            // height: "72vh",
                            maxHeight: "72vh",
                            maxWidth: "366px",
                            // width: "100%",
                            overflowY: "scroll",
                        }}>
                            <>
                                {
                                    listOfCodeHistory?.map((item: any, index: number) => {
                                        return (
                                            <ChipCard textTransform={true} count={index + 1} title={`${!item?.className ? "Class :" : item?.className} ${item?.classNumber}${item?.sectionName}`} rightBorder={true} icon={<IonIcon icon={View} color="primary" style={{ fontSize: '32px' }} onClick={() => handleOpenDetails(index)} />} />
                                        )
                                    })
                                }
                            </>
                        </div>
                    </>
                ) : (

                    <CommonModal title={"Code Link"} description={""} onClick={() => { setOpenHistoryModal(false) }}>
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "85%", overflowY: "scroll" }}>
                            <div>
                                <div style={{ display: "flex", gap: "10px", margin: "10px 0px" }}>
                                    <CustomButton icon={<IonIcon icon={Radio} />} btnText="Class" background={details.type == "Class" ? "#29B0FF" : "#FFFFFF"} txtColor={details.type == "Class" ? "white" : "#607E9C"} style={{ fontSize: "18px", textTransform: "capitalize", ...(details.type != "Class" && { border: "1px solid #607E9C" }) }} disable={true} />
                                    <CustomButton icon={<IonIcon icon={Radio} />} btnText="Students" background={details.type != "Class" ? "#29B0FF" : "#FFFFFF"} txtColor={details.type != "Class" ? "white" : "#607E9C"} style={{ fontSize: "18px", textTransform: "capitalize", ...(details.type == "Class" && { border: "1px solid #607E9C" }) }} disable={true} />
                                </div>
                                <div style={{
                                    border: "1px solid #607E9C",
                                    width: "100%",
                                    height: "1px"
                                }}></div>
                                <div style={{ display: "flex", gap: "10px", margin: "10px 0px" }}>
                                    <CommonInput value={details.classNumber} disabled={true}/>
                                    <CommonInput value={details.sectionName} disabled={true}/>
                                </div>
                                {
                                    details.type != "Class" && (
                                        <>
                                            <CommonInput textHeader="Class name" value={details.className} />
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                {/* <p style={{ color: "#607E9C", fontSize: "20px", fontWeight: "bold", marginBottom: "0px" }}>Add students</p> */}
                                                {/* <p style={{ color: "#607E9C", fontSize: "16px", fontWeight: "bold", marginBottom: "0px" }}>{details?.students} students</p> */}
                                            </div>
                                            {/* <CustomButton background="#607E9C" icon={<IonIcon icon={Plus} />} btnText="Add" onClick={() => { setIsClassModalOpen(true) }} style={{ marginTop: "10px" }} /> */}
                                        </>
                                    )
                                }
                                <div>
                                    <CommonInput textHeader="Code Link" copyInput={true} value={details.code} />
                                    <CommonInput textHeader="Product ID" copyInput={true} value={details.code} />
                                </div>

                            </div>
                            {/* <div>
                                <CustomButton btnText="Generate code" background={"#FF8429"} txtColor={"white"} style={{ fontSize: "20px", marginTop: "10px", marginBottom: "10px" }} disable={!classDetails.class || !classDetails.division || (selectedClass ? false : (!classDetails.classname || selected.length === 0))} onClick={() => generateCode()} />
                            </div> */}
                        </div>
                    </CommonModal>
                )
            }
        </div >
    )
}

export default CodeHistoryPage;