import "./theme.css";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="main-layout">
            <div className="main-content">{children}</div>
            {/* <div className="bottom-strap" /> */}
        </div>
    )
}

export default MainLayout;