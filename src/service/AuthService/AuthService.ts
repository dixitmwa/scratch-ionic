import { doFetch } from "../api";
import AUTH_API_ENDPOINTS from "./AuthEndpoints";
import { REQUEST_METHODS } from "../api";

export default {
    loginWithCodeService: (loginDetails: any) =>
        doFetch(AUTH_API_ENDPOINTS.LOGIN_WITH_CODE, REQUEST_METHODS.POST, loginDetails),
    sentOtpService: (loginDetails: any) =>
        doFetch(AUTH_API_ENDPOINTS.SEND_OTP, REQUEST_METHODS.POST, loginDetails),
    verifyOtpService: (loginDetails: any) =>
        doFetch(AUTH_API_ENDPOINTS.VERIFY_OTP, REQUEST_METHODS.POST, loginDetails),
    registerService: (registerDetails: any) =>
        doFetch(AUTH_API_ENDPOINTS.REGISTER, REQUEST_METHODS.POST, registerDetails),
    forgotPasswordService: (forgotPasswordDetails: any) =>
        doFetch(AUTH_API_ENDPOINTS.FORGOT_PASSWORD, REQUEST_METHODS.POST, forgotPasswordDetails),
    fetchLoggedUserDetailsByIdService: () =>
        doFetch(AUTH_API_ENDPOINTS.FETCH_LOGGED_USER_DETAILS, REQUEST_METHODS.GET),
    updateProfileService: (profileData: any) =>
        doFetch(AUTH_API_ENDPOINTS.UPDATE_PROFILE, REQUEST_METHODS.POST, profileData)
}