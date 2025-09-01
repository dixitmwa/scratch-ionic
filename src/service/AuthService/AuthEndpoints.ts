const AUTH_API_ENDPOINTS = {
    LOGIN_WITH_CODE: `/Auth/LoginByClassCode`,
    SEND_OTP: "/Auth/SendOtp",
    VERIFY_OTP: "/Auth/ValidateOtp",
    REGISTER: "/Auth/Signup",
    FORGOT_PASSWORD: "/Auth/ResetPassword",
    FETCH_LOGGED_USER_DETAILS: "/Auth/GetProfileDetails",
    UPDATE_PROFILE: "/Auth/UpdateProfile",
    FETCH_HISTORY_ASSIGNMENTS: "/Project/FetchProjectHistory"
};
export default AUTH_API_ENDPOINTS;