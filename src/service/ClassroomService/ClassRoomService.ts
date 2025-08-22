import { doFetch } from "../api";
import CLASSROOM_API_ENDPOINTS from "./ClassRoomEndpoints";
import { REQUEST_METHODS } from "../api";

export default {
    createClassroomService: (classDetails: any) =>
        doFetch(CLASSROOM_API_ENDPOINTS.CREATE_CLASSROOM, REQUEST_METHODS.POST, classDetails),
    fetchClassroomByIdService: (classId: string) =>
        doFetch(`${CLASSROOM_API_ENDPOINTS.FETCH_CLASSROOM_BY_ID}/${classId}`, REQUEST_METHODS.GET)
}