import { Routes, Route } from "react-router";
import { Toaster } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Tips from "./pages/Tips";
import TipDetail from "./pages/TipDetail";
import Tipsters from "./pages/Tipsters";
import TipsterProfile from "./pages/TipsterProfile";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Learn from "./pages/Learn";
import Article from "./pages/Article";
import Practice from "./pages/Practice";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Subscription from "./pages/Subscription";
import ApplyTipster from "./pages/ApplyTipster";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AppLayout>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tips" element={<Tips />} />
        <Route path="/tips/:id" element={<TipDetail />} />
        <Route path="/tipsters" element={<Tipsters />} />
        <Route path="/tipsters/:username" element={<TipsterProfile />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/:slug" element={<Article />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/apply-tipster" element={<ApplyTipster />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}
