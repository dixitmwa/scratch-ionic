import { Preferences } from "@capacitor/preferences";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
// import { useHistory } from "react-router";
const instance = axios.create();
const baseUrl = "http://192.168.1.48:90/api";
// const history = useHistory();

instance.interceptors.request.use(
    async (config) => {
        const { value } = await Preferences.get({ key: "auth" })
        if (value) {
            config.headers.Authorization = `Bearer ${value}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

instance.interceptors.response.use((response) => {
    return response;
}, async (error) => {
    debugger
    if (error?.response?.status === 401) {
        await Preferences.clear();
        // history.push("/login")
    }
    return error;
    // throw error;
})

export const doFetch = (
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    config?: AxiosRequestConfig
) => {
    debugger
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