import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ContactsBook from "./pages/ContactsBook";
import ContactDetails from "./pages/ContactDetails";
import ContactForm from "./pages/ContactForm";
import Profile from "./pages/Profile";
import Groups from "./pages/Groups";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/contacts" element={<ContactsBook />} />
              <Route path="/favorites" element={<ContactsBook favoritesOnly />} />
              <Route path="/contacts/new" element={<ContactForm />} />
              <Route path="/contacts/:id/edit" element={<ContactForm editing />} />
              <Route path="/contacts/:id" element={<ContactDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/groups" element={<Groups />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
