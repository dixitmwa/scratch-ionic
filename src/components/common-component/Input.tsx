// const CommonInput = ({
//     type = "text",
//     value = "",
//     onChange = (e: any) => { },
//     textHeader = "",
//     extraField = "",
//     prefix = ""
// }) => {
//     console.log("prefix", prefix, prefix ? "60px" : "16px")

//     return (
//         <div style={{
//             margin: "10px 0px"
//         }}>
//             <p style={{
//                 color: "#607E9C",
//                 fontSize: "24px",
//                 fontWeight: "bold",
//                 margin: "10px 0px"
//             }}>
//                 {textHeader}
//             </p>
//             {
//                 extraField && <p
//                     style={{
//                         color: "#607E9C",
//                         fontSize: "24px",
//                         fontWeight: "bold",
//                         margin: "10px 0px"
//                     }}>
//                     {extraField}
//                 </p>
//             }
//             <div style={{ position: "relative", width: "100%" }}>
//                 {prefix && (
//                     <span style={{
//                         position: "absolute",
//                         top: "50%",
//                         left: "20px",
//                         transform: "translateY(-50%)",
//                         fontSize: "20px",
//                         color: "#607E9C",
//                         pointerEvents: "none"
//                     }}>
//                         {prefix}
//                     </span>
//                 )}
//                 <input
//                     type={type}
//                     value={value}
//                     onChange={onChange}
//                     // maxLength={10}
//                     style={{
//                         border: "2px solid #607E9C",
//                         borderRadius: "50px",
//                         padding: "16px",
//                         paddingLeft: prefix ? "60px" : "16px",
//                         fontSize: "20px",
//                         color: "#607E9C",
//                         width: "100%",
//                         background: "transparent"
//                     }}
//                 />
//             </div>
//         </div>
//     )
// }

// export default CommonInput;


import { IonIcon } from "@ionic/react";
import { useState } from "react";
import HideEye from "../../assets/hide_eye.svg"
import ViewEye from "../../assets/view.svg"

const countryCodes = [
    { name: "India", code: "+91" },
    { name: "China", code: "+86" },
    { name: "Denmark", code: "+45" },
    { name: "France", code: "+33" },
    { name: "Germany", code: "+49" },
    { name: "Indonesia", code: "+62" },
    { name: "Iran", code: "+98" },
    { name: "Iraq", code: "+964" }
];

const CommonInput = ({
    type = "text",
    value = "",
    onChange = (e: any) => { },
    textHeader = "",
    extraField = "",
    prefix = "",
    showCountryCode = false,
    onCountryCodeChange = (e: any) => { },
    placeholder = ""
}) => {
    const [selectedCode, setSelectedCode] = useState("+91");
    const [showPassword, setShowPassword] = useState(false);

    const handleCodeChange = (e: any) => {
        setSelectedCode(e.target.value);
        onCountryCodeChange(e.target.value);
    };

    const isPasswordType = type === "password";

    return (
        <div style={{ margin: "0px 0px" }}>
            <p style={{
                color: "#607E9C",
                fontSize: "20px",
                fontWeight: "bold",
                margin: "10px 0px"
            }}>
                {textHeader}
            </p>

            {extraField && (
                <p style={{
                    color: "#607E9C",
                    fontSize: "24px",
                    fontWeight: "bold",
                    margin: "10px 0px"
                }}>
                    {extraField}
                </p>
            )}

            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%",
                position: "relative"
            }}>
                {showCountryCode && (
                    <select
                        value={selectedCode}
                        onChange={handleCodeChange}
                        style={{
                            border: "2px solid #607E9C",
                            borderRadius: "30px",
                            padding: "16px 14px",
                            fontSize: "20px",
                            color: "#607E9C",
                            background: "#fff",
                            appearance: "none",
                            outline: "none",
                            maxWidth: "100px",
                            width: "80px",
                        }}
                    >
                        {countryCodes.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c.code}
                            </option>
                        ))}
                    </select>
                )}

                <input
                    type={isPasswordType && showPassword ? "text" : type}
                    value={value}
                    onChange={onChange}
                    style={{
                        flex: 1,
                        border: "2px solid #607E9C",
                        borderRadius: "50px",
                        padding: "16px",
                        paddingLeft: prefix && !showCountryCode ? "60px" : "16px",
                        fontSize: "20px",
                        color: "#607E9C",
                        width: "100%",
                        background: "transparent",
                        paddingRight: isPasswordType ? "50px" : "16px" // space for eye icon
                    }}
                    placeholder={placeholder}
                />

                {prefix && !showCountryCode && (
                    <span style={{
                        position: "absolute",
                        top: "50%",
                        left: "20px",
                        transform: "translateY(-50%)",
                        fontSize: "20px",
                        color: "#607E9C",
                        pointerEvents: "none"
                    }}>
                        {prefix}
                    </span>
                )}

                {isPasswordType && (
                    <span
                        onClick={() => setShowPassword(prev => !prev)}
                        style={{
                            position: "absolute",
                            // top: "50%",
                            right: "20px",
                            // transform: "translateY(-50%)",
                            // fontSize: "20px",
                            color: "#607E9C",
                            cursor: "pointer",
                            userSelect: "none"
                        }}
                    >
                        {showPassword ? <IonIcon icon={HideEye} style={{fontSize: "32px"}}/> : <IonIcon icon={ViewEye} style={{fontSize: "32px"}} />}
                    </span>
                )}
            </div>
        </div>
    );
};

export default CommonInput;

