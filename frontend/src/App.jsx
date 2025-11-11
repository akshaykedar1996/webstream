// App.jsx
import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";

import { Toaster } from "react-hot-toast";

import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import Layout from "./components/Layout.jsx";
import { useThemeStore } from "./store/useThemeStore.js";

const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  if (isLoading) return <PageLoader />;

  return (
    <div className="h-screen" data-theme={theme}>
      <Routes>
        {/* Home */}
        <Route
          path="/"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <HomePage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

        {/* Signup */}
        <Route
          path="/signup"
          element={
            !isAuthenticated ? (
              <SignUpPage />
            ) : (
              <Navigate to={isOnboarded ? "/" : "/onboarding"} />
            )
          }
        />

        {/* Login */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <LoginPage />
            ) : (
              <Navigate to={isOnboarded ? "/" : "/onboarding"} />
            )
          }
        />

        {/* Notifications */}
        <Route
          path="/notifications"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <NotificationsPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

        {/* Call */}
        <Route
          path="/call/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <CallPage />
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

        {/* Chat */}
        <Route
          path="/chat/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={false}>
                <ChatPage /> {/* change to: <ChatPage /> or pass id */}
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

        {/* Onboarding */}
        <Route
          path="/onboarding"
          element={
            isAuthenticated ? (
              !isOnboarded ? (
                <OnboardingPage />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;


// import { Navigate, Route, Routes } from "react-router";

// import HomePage from "./pages/HomePage.jsx";
// import SignUpPage from "./pages/SignUpPage.jsx";
// import LoginPage from "./pages/LoginPage.jsx";
// import NotificationsPage from "./pages/NotificationsPage.jsx";
// import CallPage from "./pages/CallPage.jsx";
// import ChatPage from "./pages/ChatPage.jsx";
// import OnboardingPage from "./pages/OnboardingPage.jsx";

// import { Toaster } from "react-hot-toast";

// import PageLoader from "./components/PageLoader.jsx";
// import useAuthUser from "./hooks/useAuthUser.js";
// import Layout from "./components/Layout.jsx";
// import { useThemeStore } from "./store/useThemeStore.js";

// const App = () => {
//   const { isLoading, authUser } = useAuthUser();
//   const { theme } = useThemeStore();

//   const isAuthenticated = Boolean(authUser);
//   const isOnboarded = authUser?.isOnboarded;

//   if (isLoading) return <PageLoader />;

//   return (
//     <div className="h-screen" data-theme={theme}>
//       <Routes>
//         <Route
//           path="/"
//           element={
//             isAuthenticated && isOnboarded ? (
//               <Layout showSidebar={true}>
//                 <HomePage />
//               </Layout>
//             ) : (
//               <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
//             )
//           }
//         />
//         <Route
//           path="/signup"
//           element={
//             !isAuthenticated ? <SignUpPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />
//           }
//         />
//         <Route
//           path="/login"
//           element={
//             !isAuthenticated ? <LoginPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />
//           }
//         />
//         <Route
//           path="/notifications"
//           element={
//             isAuthenticated && isOnboarded ? (
//               <Layout showSidebar={true}>
//                 <NotificationsPage />
//               </Layout>
//             ) : (
//               <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
//             )
//           }
//         />
//         <Route
//           path="/call/:id"
//           element={
//             isAuthenticated && isOnboarded ? (
//               <CallPage />
//             ) : (
//               <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
//             )
//           }
//         />

//         <Route
//           path="/chat/:id"
//           element={
//             isAuthenticated && isOnboarded ? (
//               <Layout showSidebar={false}>
//                 <ChatPage />
//               </Layout>
//             ) : (
//               <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
//             )
//           }
//         />

//         <Route
//           path="/onboarding"
//           element={
//             isAuthenticated ? (
//               !isOnboarded ? (
//                 <OnboardingPage />
//               ) : (
//                 <Navigate to="/" />
//               )
//             ) : (
//               <Navigate to="/login" />
//             )
//           }
//         />
//       </Routes>

//       <Toaster />
//     </div>
//   );
// };
// export default App;
