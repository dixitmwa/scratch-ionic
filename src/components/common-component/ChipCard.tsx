const ChipCard = ({
    title = "",
    icon,
    count, // new
    textTransform = false,
    rightBorder = false
}: {
    title: React.ReactNode | string;
    icon?: React.ReactNode;
    count?: number | string; // optional count
    textTransform?: boolean;
    rightBorder?: boolean;
}) => {
    return (
        <div style={{
            background: "#FFF",
            boxShadow: "0 2px 2px 0 rgba(0, 0, 0, 0.15)",
            borderRadius: "20px",
            maxWidth: "360px",
            width: "100%",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            height: "70px",
            paddingRight: "15px",
            borderRight: rightBorder ? "4px solid #2A97F2" : "",
        }} key={count}>
            {typeof count !== "undefined" && (
                <div style={{
                    background: "#FBCC13",
                    height: "100%",
                    padding: "0 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderTopLeftRadius: "20px",
                    borderBottomLeftRadius: "20px",
                    width: "60px",
                }}>
                    <p style={{
                        color: "#B57121",
                        fontSize: "32px",
                        fontWeight: 700
                    }}>{count}</p>
                </div>
            )}

            <div style={{ flex: 1, paddingLeft: count ? "5px" : "15px" }}>
                <p style={{
                    color: "#607E9C",
                    fontSize: "20px",
                    fontWeight: 600,
                    margin: 0,
                    textTransform: textTransform ? "uppercase" : "none"
                }}>{title}</p>
            </div>

            <div>
                {icon}
            </div>
        </div>
    )
}

export default ChipCard;
