import { Preferences } from "@capacitor/preferences";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
// import { useHistory } from "react-router";
const instance = axios.create();
const baseUrl = "https://cb7f5113f469.ngrok-free.app/api";
export const rootUrl = "https://cb7f5113f469.ngrok-free.app/";
// const baseUrl = "http://192.168.1.48:7055/api";
// export const rootUrl = "http://192.168.1.48:7055/";
// const history = useHistory();

instance.interceptors.request.use(
    async (config) => {
        const { value } = await Preferences.get({ key: "auth" })
        if (value) {
            config.headers.Authorization = `Bearer ${value}`;
        }
        config.headers['ngrok-skip-browser-warning'] = true;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use((response) => {
    return response;
}, async (error) => {
    console.log("error", error?.response)
    if (error?.response?.status === 401) {
        await Preferences.clear();
        // history.push("/login")
    }
    debugger
    return error.response;
    // throw error;
})

export const doFetch = (
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    config?: AxiosRequestConfig
) => {
    return instance({
        url: baseUrl + url,
        method,
        data,
        ...config
    });
};

export const REQUEST_METHODS = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    DELETE: "DELETE",
} as const;