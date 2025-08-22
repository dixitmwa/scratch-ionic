import { doFetch } from "../api";
import CODELINK_API_ENDPOINTS from "./CodeLinkEndpoints";
import { REQUEST_METHODS } from "../api";

export default {
    fetchClassAndDivisionService: () =>
        doFetch(CODELINK_API_ENDPOINTS.FETCH_CLASS_AND_DIVISION, REQUEST_METHODS.GET),
    generateCodeService: (classDetails: any) =>
        doFetch(CODELINK_API_ENDPOINTS.GENERATE_CODE, REQUEST_METHODS.POST, classDetails),
    fetchCodeHistoryService: () =>
        doFetch(CODELINK_API_ENDPOINTS.FETCH_CODE_HISTORY, REQUEST_METHODS.GET),
    fetchStudentsByDivisionService: (details?: { classId?: string, sectionId?: string }) => {
        let query = "";

        if (details) {
            const params: string[] = [];

            if (details.classId) {
                params.push(`classId=${details.classId}`);
            }
            if (details.sectionId) {
                params.push(`sectionId=${details.sectionId}`);
            }

            if (params.length) {
                query = `?${params.join("&")}`;
            }
        }
        return doFetch(`${CODELINK_API_ENDPOINTS.FETCH_STUDENTS_BY_DIVISION}${query}`, REQUEST_METHODS.GET)
    }
}