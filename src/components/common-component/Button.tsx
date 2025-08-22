import './CustomButton.css';

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
}) => {
    return (
        <button
            onClick={onClick}
            className="role-button"
            style={{ background: background, color: txtColor, opacity: disable ? 0.5 : 1, ...style }}
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
        </button >
    )
}

export default CustomButton;