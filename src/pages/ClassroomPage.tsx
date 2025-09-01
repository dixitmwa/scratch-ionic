import { IonIcon } from "@ionic/react";
import { useEffect, useState } from "react";
import ChipCard from "../components/common-component/ChipCard";
import RightArrow from '../assets/right_arrow.svg'
import { useHistory } from "react-router";
import CustomButton from "../components/common-component/Button";
import PlusButton from "../assets/plus_button.svg"
import Plus from "../assets/plus.svg"
import SearchInput from "../components/common-component/SearchInput";
import ClassRoomService from "../service/ClassroomService/ClassRoomService";
import { Preferences } from "@capacitor/preferences";
import Loader from "../components/common-component/Loader";

const ClassroomPage = () => {
    const history = useHistory();
    const [isLoading, setIsLoading] = useState(false);
    const [classroomList, setClassroomList] = useState([])
    const [inputValue, setInputValue] = useState("")
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    const handleSearch = (val?: string) => {
        const searchVal = typeof val === 'string' ? val : inputValue;
        if (searchTimeout) clearTimeout(searchTimeout);
        const timeout = setTimeout(() => {
            fetchClassrooms(searchVal);
        }, 400);
        setSearchTimeout(timeout);
    };

    const fetchClassrooms = async (search: string = "") => {
        setIsLoading(true);
        const response = await ClassRoomService.fetchAllClassroomsService(search);
        if (response.status === 200) {
            setClassroomList(response.data.data);
        }
        setIsLoading(false);
    }

    const navigateToDetails = async (sectionId: string) => {
        console.log('sectionId', sectionId)
        await Preferences.set({ key: "sectionId", value: sectionId });
        history.push(`/tabs/classroom/details`);
    }

    useEffect(() => {
        fetchClassrooms();
    }, [])

    useEffect(() => {
        if (inputValue === "") {
            fetchClassrooms("");
        } else {
            handleSearch(inputValue);
        }
        return () => {
            if (searchTimeout) clearTimeout(searchTimeout);
        };
    }, [inputValue]);

    return (
        isLoading ? (
            <Loader />
        ) : (
            < div style={{
                margin: "6vh 10px 10px 10px",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                justifyContent: "center",
                maxHeight: "79vh",
                overflowY: "scroll"
            }
            }>
                {
                    classroomList.length > 0 ? (
                        <>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", width: "100%" }}>
                                <div style={{ width: "38px" }}></div>
                                <SearchInput
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    onSearch={() => handleSearch()}
                                />
                                <IonIcon icon={PlusButton} color="#D929FF" style={{ fontSize: '38px' }} onClick={() => { history.push("/tabs/classroom/create") }} />
                            </div>
                            {
                                classroomList.map((item: any, index: number) => (
                                    <>
                                        <ChipCard textTransform={true} count={index + 1} title={
                                            <div style={{ display: "flex", flexDirection: "column" }}>
                                                <p style={{ margin: "0px", fontWeight: 600, fontSize: "20px" }}>{item.className}</p>
                                                <p style={{ margin: "0px", fontSize: "16px" }}>20-aug</p>
                                            </div>} icon={<IonIcon icon={RightArrow} color="primary" style={{ fontSize: '32px' }} onClick={() => { navigateToDetails(item.sectionId) }} />} />
                                        {/* <div style={{ marginBottom: "10px" }}></div> */}
                                    </>
                                ))
                            }
                        </>
                    ) : (
                        <div>
                            <div style={{ display: "flex", justifyContent: "end", alignItems: "flex-end" }}>
                                <CustomButton btnText="" style={{ width: "auto" }} icon={<IonIcon icon={Plus} color="#D929FF" style={{ fontSize: '24px' }} onClick={() => { history.push("/tabs/classroom/create") }} />} />
                            </div>
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh", textAlign: "center", color: "#607E9C" }}>
                                <h1>No class yet create new classrooms</h1>
                            </div>
                        </div>
                    )
                }
            </div >
        )

    )
}

export default ClassroomPage;