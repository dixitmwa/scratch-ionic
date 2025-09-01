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
import CodeHistoryPage from "../pages/CodeHistoryPage";
import ClassroomPage from "../pages/ClassroomPage";
import ClassroomCreatePage from "../pages/ClassroomCreatePage";
import ClassroomDetailsPage from "../pages/ClassroomDetailsPage";
import AssignmentPage from "../pages/AssignmentPage";
import AssignmentCreatePage from "../pages/AssignmentCreatePage";
import AssignmentUpcomingPage from "../pages/AssignmentUpcomingPage";
import AssignmentHistoryPage from "../pages/AssignmentHistoryPage";
import MyLibraryPage from "../pages/MyLibraryPage";
import AssignmentDetailsPage from "../pages/AssignmentDetailsPage";

const TabsLayout = () => {
  const [showTab, setShowTab] = useState(true);
  const [isStudent, setIsStudent] = useState(true)
  const history = useHistory();
  const location = useLocation();

  const fetchUserType = async () => {
    const { value } = await Preferences.get({ key: "userType" })
    console.log("value", value)
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
          <Route exact path="/tabs/editor/my-library" component={MyLibraryPage} />
          <Route exact path="/tabs/scratch-editor" component={ScratchWorkspace} />
          <Route exact path="/tabs/history" component={HistoryPage} />
          <Route exact path="/tabs/project" component={ProjectPage} />
          <Route exact path="/tabs/project/details" component={ProjectDetailsPage} />
          <Route exact path="/tabs/profile" component={ProfilePage} />
          <Route exact path="/tabs/profile/code-history" component={CodeHistoryPage} />
          <Route exact path="/tabs/playground" component={PlaygroundPage} />
          <Route exact path="/tabs/classroom" component={ClassroomPage} />
          <Route exact path="/tabs/classroom/create" component={ClassroomCreatePage} />
          <Route exact path="/tabs/classroom/details" component={ClassroomDetailsPage} />
          <Route exact path="/tabs/assignment" component={AssignmentPage} />
          <Route exact path="/tabs/assignment/create" component={AssignmentCreatePage} />
          <Route exact path="/tabs/assignment/upcoming" component={AssignmentUpcomingPage} />
          <Route exact path="/tabs/assignment/history" component={AssignmentHistoryPage} />
          <Route exact path="/tabs/assignment/details" component={AssignmentDetailsPage} />
          {/* <Route exact path="/tabs/assignment/details" component={AssignmentDetailsPage} /> */}
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
              <IonTabButton tab="history" href="/tabs/history" className={location.pathname.startsWith("/tabs/history") ? "active-tab" : ""}>
                <IonIcon icon={HistoryTab} />
                <IonLabel>History</IonLabel>
              </IonTabButton>
              <IonTabButton tab="project" href="/tabs/project" className={location.pathname.startsWith("/tabs/project") ? "active-tab" : ""}>
                <IonIcon icon={ProjectTab} />
                <IonLabel>Project</IonLabel>
              </IonTabButton>
              <IonTabButton tab="profile" href="/tabs/profile" className={location.pathname.startsWith("/tabs/profile") ? "active-tab" : ""}>
                <IonIcon icon={ProfileTab} />
                <IonLabel>Profile</IonLabel>
              </IonTabButton>
            </IonTabBar>
          )
        }

        {
          showTab && !isStudent && (
            <IonTabBar slot="bottom" className="custom-tab-bar">
              <IonTabButton tab="editor" href="/tabs/editor" className={location.pathname.startsWith("/tabs/editor") ? "active-tab" : ""}>
                <IonIcon icon={ScannerTab} />
                {/* <img src={Scanner}/> */}
                <IonLabel>Playground</IonLabel>
              </IonTabButton>
              <IonTabButton tab="classroom" href="/tabs/classroom" className={location.pathname.startsWith("/tabs/classroom") ? "active-tab" : ""}>
                <IonIcon icon={ClassroomTab} />
                <IonLabel>Classroom</IonLabel>
              </IonTabButton>
              <IonTabButton tab="assignment" href="/tabs/assignment" className={location.pathname.startsWith("/tabs/assignment") ? "active-tab" : ""}>
                <IonIcon icon={ProjectTab} />
                <IonLabel>Assignments</IonLabel>
              </IonTabButton>
              <IonTabButton tab="profile" href="/tabs/profile" className={location.pathname.startsWith("/tabs/profile") ? "active-tab" : ""}>
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