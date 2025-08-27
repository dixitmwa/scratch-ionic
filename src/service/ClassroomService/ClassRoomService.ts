import { doFetch } from "../api";
import CLASSROOM_API_ENDPOINTS from "./ClassRoomEndpoints";
import { REQUEST_METHODS } from "../api";

export default {
    createClassroomService: (classDetails: any) =>
        doFetch(CLASSROOM_API_ENDPOINTS.CREATE_CLASSROOM, REQUEST_METHODS.POST, classDetails),
    fetchAllClassroomsService: () =>
        doFetch(CLASSROOM_API_ENDPOINTS.FETCH_ALL_CLASSROOMS, REQUEST_METHODS.GET),
    fetchClassroomByIdService: (classId: string) =>
        doFetch(`${CLASSROOM_API_ENDPOINTS.FETCH_CLASSROOM_BY_ID}/${classId}`, REQUEST_METHODS.GET),
    fetchSectionByIdService: (sectionId: string) =>
        doFetch(`${CLASSROOM_API_ENDPOINTS.FETCH_SECTION_BY_ID}/${sectionId}`, REQUEST_METHODS.GET),
    updateClassroomService: (classQuery: any, classDetails: any) =>
        doFetch(`${CLASSROOM_API_ENDPOINTS.UPDATE_CLASSROOM}?classId=${classQuery.classId}&sectionId=${classQuery.sectionId}`, REQUEST_METHODS.POST, classDetails),
    fetchStudentProjectsService: (studentId: string) =>
        doFetch(`${CLASSROOM_API_ENDPOINTS.FETCH_STUDENT_PROJECTS}?studentId=${studentId}`, REQUEST_METHODS.GET)
}