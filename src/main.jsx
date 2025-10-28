import { createRoot } from "react-dom/client";
import React, { lazy, Suspense } from "react";
import "./index.css";
import App from "./App.jsx";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import OtpEnter from "./pages/OtpEnter.jsx";

import { AppContextProvider, useAppContext } from "./context/AppContext";
import ItemDetail from "./pages/ItemDetail.jsx";
import Cart from "./pages/Cart.jsx";
import CartButton from "./components/CartButton.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Navbar from "./components/Navbar.jsx";
import VariationPage from "./pages/VariationPage.jsx";
import NewCartPage from "./pages/NewCartPage.jsx";
import Profile from "./pages/Profile.jsx";
import ProfileUpdate from "./components/ProfileUpdate.jsx";
import OrdersPage from "./pages/OrdersPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OrderDetailsPage from "./pages/OrderDetailsPage.jsx";
import SavedAddresses from "./pages/Addresses.jsx";
import ItemDetailsPage from "./pages/ItemDetailsPage.jsx";

const OrderConfirmationPage = lazy(() =>
  import("./pages/OrderConfirmationPage.jsx")
);

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAppContext();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Auth route component (redirects to home if already logged in)
const AuthRoute = ({ children }) => {
  const { currentUser } = useAppContext();

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <>
                <Home />
                <CartButton />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          }
        />
        <Route
          path="/verification"
          element={
            <AuthRoute>
              <OtpEnter />
            </AuthRoute>
          }
        />

        <Route
          path="/item-detail"
          element={
            <ProtectedRoute>
              <>
                <Navbar />
                <ItemDetail />
              </>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <NewCartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <>
              <Navbar />
              <Profile />
            </>
          }
        />
        <Route
          path="/profile-update"
          element={
            <>
              <Navbar></Navbar>
              <ProfileUpdate />
            </>
          }
        />
        <Route
          path="/orders"
          element={
            <>
              <Navbar />
              <OrdersPage />
            </>
          }
        />
        <Route
          path="/order-confirmation/:orderId?"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <OrderConfirmationPage />
            </Suspense>
          }
        />
        <Route path="/order/:orderId" element={<OrderDetailsPage />} />
        <Route
          path="/addresses"
          element={
            <>
              <Navbar />
              <SavedAddresses />
            </>
          }
        />
        <Route
          path="/item/:id"
          element={
            <ProtectedRoute>
              <ItemDetailsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <ToastContainer position="bottom-center" autoClose={3000} />
    </>
  );
};

createRoot(document.getElementById("root")).render(
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}
  >
    <AppContextProvider>
      <AppRoutes />
    </AppContextProvider>
  </BrowserRouter>
);
