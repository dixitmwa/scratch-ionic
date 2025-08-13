import './CustomButton.css';

const CustomButton = ({
    btnText = "Button",
    onClick = () => { },
    background = "#29B0FF",
    txtColor = "white",
    disable = false,
    icon = null,
    style = {},
    ...props
}) => {
    return (
        <button
            onClick={onClick}
            className="role-button"
            style={{ background: background, color: txtColor, opacity: disable ? 0.5 : 1, ...style }}
            disabled={disable}
            {...props}
        >
            {icon ? icon : btnText}
        </button >
    )
}

export default CustomButton;