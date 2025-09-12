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
import AssignmentBlockViewPage from "../pages/AssignmentBlockViewPage";
import AssignmentBlockVideoPage from "../pages/AssignmentBlockVideoPage";

const TabsLayout = () => {
  const [showTab, setShowTab] = useState(true);
  const [isStudent, setIsStudent] = useState(true)
  const history = useHistory();
  const location = useLocation();

  const fetchUserType = async () => {
    const { value } = await Preferences.get({ key: "userType" })
    console.log("value", value)
    if (value?.toLowerCase() === "student") {
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
    // <MainLayout>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/tabs/editor" render={() => <IonPage><EditorPage /></IonPage>} />
          <Route exact path="/tabs/editor/my-library" render={() => <IonPage><MyLibraryPage /></IonPage>} />
          <Route exact path="/tabs/scratch-editor" render={() => <IonPage><ScratchWorkspace /></IonPage>} />
          <Route exact path="/tabs/history" render={() => <IonPage><HistoryPage /></IonPage>} />
          <Route exact path="/tabs/project" render={() => <IonPage><ProjectPage /></IonPage>} />
          <Route exact path="/tabs/project/details" render={() => <IonPage><ProjectDetailsPage /></IonPage>} />
          <Route exact path="/tabs/profile" render={() => <IonPage><ProfilePage /></IonPage>} />
          <Route exact path="/tabs/profile/code-history" render={() => <IonPage><CodeHistoryPage /></IonPage>} />
          <Route exact path="/tabs/playground" render={() => <IonPage><PlaygroundPage /></IonPage>} />
          <Route exact path="/tabs/classroom" render={() => <IonPage><ClassroomPage /></IonPage>} />
          <Route exact path="/tabs/classroom/create" render={() => <IonPage><ClassroomCreatePage /></IonPage>} />
          <Route exact path="/tabs/classroom/details" render={() => <IonPage><ClassroomDetailsPage /></IonPage>} />
          <Route exact path="/tabs/assignment" render={() => <IonPage><AssignmentPage /></IonPage>} />
          <Route exact path="/tabs/assignment/create" render={() => <IonPage><AssignmentCreatePage /></IonPage>} />
          <Route exact path="/tabs/assignment/upcoming" render={() => <IonPage><AssignmentUpcomingPage /></IonPage>} />
          <Route exact path="/tabs/assignment/history" render={() => <IonPage><AssignmentHistoryPage /></IonPage>} />
          <Route exact path="/tabs/assignment/details" render={() => <IonPage><AssignmentDetailsPage /></IonPage>} />
          <Route exact path="/tabs/assignment/project-view" render={() => <IonPage><AssignmentBlockViewPage /></IonPage>} />
          <Route exact path="/tabs/assignment/project-video" render={() => <IonPage><AssignmentBlockVideoPage /></IonPage>} />
        </IonRouterOutlet>

        {
          showTab && isStudent && (
            <IonTabBar slot="bottom" className="custom-tab-bar">
              <IonTabButton tab="editor" href="/tabs/editor" className={location.pathname.startsWith("/tabs/editor") ? "active-tab" : ""}>
                <IonIcon icon={ScannerTab} />
                {/* <img src={Scanner}/> */}
                <IonLabel className="custom-tab-label">Playground</IonLabel>
              </IonTabButton>
              <IonTabButton tab="history" href="/tabs/history" className={location.pathname.startsWith("/tabs/history") ? "active-tab" : ""}>
                <IonIcon icon={HistoryTab} />
                <IonLabel className="custom-tab-label">My Library</IonLabel>
              </IonTabButton>
              <IonTabButton tab="project" href="/tabs/project" className={location.pathname.startsWith("/tabs/project") ? "active-tab" : ""}>
                <IonIcon icon={ProjectTab} />
                <IonLabel className="custom-tab-label">Project</IonLabel>
              </IonTabButton>
              <IonTabButton tab="profile" href="/tabs/profile" className={location.pathname.startsWith("/tabs/profile") ? "active-tab" : ""}>
                <IonIcon icon={ProfileTab} />
                <IonLabel className="custom-tab-label">Profile</IonLabel>
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
                <IonLabel className="custom-tab-label">Playground</IonLabel>
              </IonTabButton>
              <IonTabButton tab="classroom" href="/tabs/classroom" className={location.pathname.startsWith("/tabs/classroom") ? "active-tab" : ""}>
                <IonIcon icon={ClassroomTab} />
                <IonLabel className="custom-tab-label">Classroom</IonLabel>
              </IonTabButton>
              <IonTabButton tab="assignment" href="/tabs/assignment" className={location.pathname.startsWith("/tabs/assignment") ? "active-tab" : ""}>
                <IonIcon icon={ProjectTab} />
                <IonLabel className="custom-tab-label">Assignments</IonLabel>
              </IonTabButton>
              <IonTabButton tab="profile" href="/tabs/profile" className={location.pathname.startsWith("/tabs/profile") ? "active-tab" : ""}>
                <IonIcon icon={ProfileTab} />
                <IonLabel className="custom-tab-label">Profile</IonLabel>
              </IonTabButton>
            </IonTabBar>
          )
        }
      </IonTabs>
    // </MainLayout>
  );
};

export default TabsLayout;