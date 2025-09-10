import { doFetch, REQUEST_METHODS } from "../api";
import ASSIGNMENT_API_ENDPOINTS from "./AssignmentEndpoints";

export default {
    createAssignmentService: (details: any) =>
        doFetch(ASSIGNMENT_API_ENDPOINTS.CREATE_ASSIGNMENT, REQUEST_METHODS.POST, details),
    fetchAssignmentByTypeService: (details: any) => {
        let url = `${ASSIGNMENT_API_ENDPOINTS.FETCH_ASSIGNMENT_BY_TYPE}?type=${details.type}`;
        if (details.search && details.search.trim() !== "") {
            url += `&search=${encodeURIComponent(details.search)}`;
        }
        return doFetch(url, REQUEST_METHODS.GET, details);
    },
    fetchAssignmentByIdService: (id: string) => {
        const url = `${ASSIGNMENT_API_ENDPOINTS.FETCH_ASSIGNMENT_BY_ID}/${id}`;
        return doFetch(url, REQUEST_METHODS.GET);
    },
    validateAnswerService: (details: any) =>
        doFetch(ASSIGNMENT_API_ENDPOINTS.VALIDATE_ANSWER, REQUEST_METHODS.POST, details),
    updateAssignmentService: (details: any) =>
        doFetch(ASSIGNMENT_API_ENDPOINTS.UPDATE_ASSIGNMENT, REQUEST_METHODS.POST, details),
}