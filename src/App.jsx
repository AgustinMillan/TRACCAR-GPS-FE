import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import MapView from "./views/MapView";
import MotorBikeManagement from "./views/MotorBikeManagement";
import BalanceView from "./views/BalanceView";
import ReportsView from "./views/ReportsView";
import Login from "./views/Login";
import CategoriesView from "./views/CategoriesView";
import ClientsView from "./views/ClientsView";
import UsersView from "./views/UsersView";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/map" element={<MapView />} />
          <Route path="/motorcycles" element={<MotorBikeManagement />} />
          <Route path="/balance" element={<BalanceView />} />
          <Route path="/reports" element={<ReportsView />} />
          <Route path="/categories" element={<CategoriesView />} />
          <Route path="/clients" element={<ClientsView />} />
          <Route path="/users" element={<UsersView />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/balance" replace />} />
    </Routes>
  );
}

export default App;
