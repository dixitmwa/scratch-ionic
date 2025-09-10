import './CustomButton.css';
import { ReactNode } from 'react';

interface CustomButtonProps {
    btnText?: string;
    onClick?: () => void;
    background?: string;
    txtColor?: string;
    disable?: boolean;
    icon?: ReactNode;
    style?: React.CSSProperties;
    isLoading?: boolean;
    [key: string]: any;
}

const CustomButton = ({
    btnText = "Button",
    onClick = () => { },
    background = "#29B0FF",
    txtColor = "white",
    disable = false,
    icon = null,
    style = {},
    isLoading = false,
    ...props
}: CustomButtonProps) => {
    const buttonStyle = disable
        ? { background, color: txtColor, opacity: 0.5, pointerEvents: 'none' as React.CSSProperties['pointerEvents'], ...style, transform: undefined }
        : { background, color: txtColor, opacity: 1, ...style };
    return (
        <button
            onClick={onClick}
            className="role-button"
            style={buttonStyle}
            disabled={disable || isLoading}
            {...props}
        >
            {
                isLoading ? (
                    <span className="custom-btn-loader"></span>
                ) : (
                    <>
                        {
                            icon && (
                                <span style={{ ...btnText ? { marginRight: "10px" } : {}, padding: 0 }}>
                                    {icon}
                                </span>
                            )
                        }
                        {btnText}
                    </>
                )
            }
        </button>
    )
}

export default CustomButton;