import { doFetch } from "../api";
import AUTH_API_ENDPOINTS from "./AuthEndpoints";
import { REQUEST_METHODS } from "../api";

export default {
    loginWithCodeService: (loginDetails: any) =>
        doFetch(AUTH_API_ENDPOINTS.LOGIN_WITH_CODE, REQUEST_METHODS.POST, loginDetails),
}