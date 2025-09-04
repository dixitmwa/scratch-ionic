import React from "react";

const CommonCard = ({
    headerText = "",
    bottomText = "",
    children,
    style = {},
    border = false,
    onClick = () => { }
}: {
    headerText?: React.ReactNode; // <-- changed from string to React.ReactNode
    bottomText?: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
    border?: boolean;
    onClick?: () => void
}) => {

    return (
        <div onClick={onClick}>
            <div style={{
                background: "#FFF",
                boxShadow: "0 2px 2px 0 rgba(0, 0, 0, 0.15)",
                borderRadius: "20px",
                width: "100%",
                overflow: "hidden",
                border: border ? "2px solid blue" : ""
            }}>
                {headerText !== "" && (
                    typeof headerText === "string" ? (
                        <div
                            style={{
                                fontSize: "24px",
                                fontWeight: "bold",
                                padding: "20px",
                                background: "#29B0FF",
                                borderTopLeftRadius: "20px",
                                borderTopRightRadius: "20px",
                                color: "white",
                                textTransform: "uppercase",
                                textAlign: "center"
                            }}>
                            {headerText}
                        </div>
                    ) : (
                        // If headerText is a React node, render as-is (your custom header styling)
                        headerText
                    )
                )}
                <div style={{ padding: "20px", ...style }}>
                    {children}
                </div>
                {bottomText !== "" && (<div
                    style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        padding: "10px",
                        background: "#29B0FF",
                        borderBottomLeftRadius: "20px",
                        borderBottomRightRadius: "20px",
                        color: "white",
                        textTransform: "uppercase",
                        textAlign: "center"
                    }}>
                    {bottomText}
                </div>)}
            </div>
        </div >
    )
}

export default CommonCard;