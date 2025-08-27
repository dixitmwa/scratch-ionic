import { doFetch, REQUEST_METHODS } from "../api";
import ASSIGNMENT_API_ENDPOINTS from "./AssignmentEndpoints";

export default {
    createAssignmentService: (details: any) =>
        doFetch(ASSIGNMENT_API_ENDPOINTS.CREATE_ASSIGNMENT, REQUEST_METHODS.POST, details)
}