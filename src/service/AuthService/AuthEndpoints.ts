const AUTH_API_ENDPOINTS = {
    LOGIN_WITH_CODE: `/Auth/LoginByClassCode`,
    SEND_OTP: "/Auth/SendOtp",
    VERIFY_OTP: "/Auth/ValidateOtp",
    REGISTER: "/Auth/Signup",
    FORGOT_PASSWORD: "/Auth/ResetPassword",
    VERIFY_CODELINK: "/ClassCode/VerifyCode",
    FETCH_LOGGED_USER_DETAILS: "/Auth/GetProfileDetails",
    UPDATE_PROFILE: "/Auth/UpdateProfile",
    FETCH_HISTORY_ASSIGNMENTS: "/Project/FetchProjectHistory",
    FETCH_SCHOOLWISE_CLASSES: "/Class/GetSchoolsWithClassesAndSections"
};
export default AUTH_API_ENDPOINTS;