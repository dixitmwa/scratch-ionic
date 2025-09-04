import { IonIcon } from "@ionic/react";
import ChipCard from "../components/common-component/ChipCard";
import View from '../assets/view.svg'
import { useEffect, useState } from "react";
import AuthService from "../service/AuthService/AuthService";

const HistoryPage = () => {

    const [assignmentList, setAssignmentList] = useState([{}, {}, {}])
    const [isLoading, setIsLoading] = useState(false)

    const fetchHistory = async () => {
        setIsLoading(true)
        const response = await AuthService.fetchAssignmentHistoryService()
        if (response?.status === 200) {
            setAssignmentList(response?.data?.data);
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchHistory()

        return () => {
            setAssignmentList([])
        }
    }, [])

    return (
        // <IonPage>
        <div style={{
            margin: "6vh 10px 10px 10px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
            maxHeight: "79vh",
            overflowY: "scroll"
        }}>
            {
                assignmentList.map((item: any, index) => {
                    return (
                        <ChipCard textTransform={true} count={index + 1} title={item.title} rightBorder={true} icon={<IonIcon icon={View} color="primary" style={{ fontSize: '32px' }} />} />
                    )
                })
            }
        </div>
        // </IonPage>
    )
}

export default HistoryPage;