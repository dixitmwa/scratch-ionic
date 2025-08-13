import {
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonPage
} from "@ionic/react";
import { Route, useHistory, useLocation } from "react-router";
import EditorPage from "../pages/EditorPage";
import PlaygroundPage from "../pages/PlaygroundPage";
import MainLayout from "./MainLayout";
import { useEffect, useState } from "react";
import ScratchWorkspace from "../components/ScratchWorkspace";
import ProfilePage from "../pages/ProfilePage";
import ProjectPage from "../pages/ProjectPage";
import HistoryPage from "../pages/HistoryPage";
import ScannerTab from "../assets/scanner_tab.svg"
import HistoryTab from "../assets/history_tab.svg"
import ProjectTab from "../assets/project_tab.svg"
import ProfileTab from "../assets/profile_tab.svg"
import ClassroomTab from "../assets/classroom.svg"
import ProjectDetailsPage from "../pages/ProjectDetails";
import { Preferences } from "@capacitor/preferences";

const TabsLayout = () => {
  const [showTab, setShowTab] = useState(true);
  const [isStudent, setIsStudent] = useState(true)
  const history = useHistory();
  const location = useLocation();

  const fetchUserType = async () => {
    const { value } = await Preferences.get({ key: "userType" })
    if (value === "student") {
      setIsStudent(true)
    } else {
      setIsStudent(false)
    }
  }

  useEffect(() => {
    fetchUserType()
    if (location.pathname === "/tabs") {
      history.replace("/tabs/editor");
    }

    if (location.pathname === "/tabs/scratch-editor" || location.pathname === "/tabs/playground") {
      setShowTab(false);
    } else {
      setShowTab(true)
    }
  }, [location.pathname, history]);

  return (
    <MainLayout>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/tabs/editor" component={EditorPage} />
          <Route exact path="/tabs/editor/my-library" component={EditorPage} />
          <Route exact path="/tabs/history" component={HistoryPage} />
          <Route exact path="/tabs/project" component={ProjectPage} />
          <Route exact path="/tabs/project/details" component={ProjectDetailsPage} />
          <Route exact path="/tabs/profile" component={ProfilePage} />
          <Route exact path="/tabs/playground" component={PlaygroundPage} />
          <Route exact path="/tabs/scratch-editor" component={ScratchWorkspace} />
          {/* <Redirect exact from="/tabs" to="/tabs/home" /> */}
        </IonRouterOutlet>

        {
          showTab && isStudent && (
            <IonTabBar slot="bottom" className="custom-tab-bar">
              <IonTabButton tab="editor" href="/tabs/editor" className={location.pathname.startsWith("/tabs/editor") ? "active-tab" : ""}>
                <IonIcon icon={ScannerTab} />
                {/* <img src={Scanner}/> */}
                <IonLabel>Playground</IonLabel>
              </IonTabButton>
              <IonTabButton tab="history" href="/tabs/history" className={location.pathname === "/tabs/history" ? "active-tab" : ""}>
                <IonIcon icon={HistoryTab} />
                <IonLabel>History</IonLabel>
              </IonTabButton>
              <IonTabButton tab="project" href="/tabs/project" className={location.pathname.startsWith("/tabs/project") ? "active-tab" : ""}>
                <IonIcon icon={ProjectTab} />
                <IonLabel>Project</IonLabel>
              </IonTabButton>
              <IonTabButton tab="profile" href="/tabs/profile" className={location.pathname === "/tabs/profile" ? "active-tab" : ""}>
                <IonIcon icon={ProfileTab} />
                <IonLabel>Profile</IonLabel>
              </IonTabButton>
            </IonTabBar>
          )
        }

        {
          showTab && !isStudent && (
            <IonTabBar slot="bottom" className="custom-tab-bar">
              <IonTabButton tab="editor" href="/tabs/editor" className={location.pathname === "/tabs/editor" ? "active-tab" : ""}>
                <IonIcon icon={ScannerTab} />
                {/* <img src={Scanner}/> */}
                <IonLabel>Playground</IonLabel>
              </IonTabButton>
              <IonTabButton tab="history" href="/tabs/history" className={location.pathname === "/tabs/history" ? "active-tab" : ""}>
                <IonIcon icon={ClassroomTab} />
                <IonLabel>Classroom</IonLabel>
              </IonTabButton>
              <IonTabButton tab="project" href="/tabs/project" className={location.pathname.startsWith("/tabs/project") ? "active-tab" : ""}>
                <IonIcon icon={ProjectTab} />
                <IonLabel>Assignments</IonLabel>
              </IonTabButton>
              <IonTabButton tab="profile" href="/tabs/profile" className={location.pathname === "/tabs/profile" ? "active-tab" : ""}>
                <IonIcon icon={ProfileTab} />
                <IonLabel>Profile</IonLabel>
              </IonTabButton>
            </IonTabBar>
          )
        }
      </IonTabs>
    </MainLayout>
  );
};

export default TabsLayout;