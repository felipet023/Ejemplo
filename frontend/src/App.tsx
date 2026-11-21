import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import EmployeesPage from "./pages/EmployeesPage";
import EmployeeFormPage from "./pages/EmployeeFormPage";
import EmployeeProfilePage from "./pages/EmployeeProfilePage";
import NewEvaluationPage from "./pages/NewEvaluationPage";
import QuestionnairePage from "./pages/QuestionnairePage";
import ResultPage from "./pages/ResultPage";
import EligibilityPage from "./pages/EligibilityPage";
import HistoryPage from "./pages/HistoryPage";
import ReportsPage from "./pages/ReportsPage";
import QuestionsAdminPage from "./pages/QuestionsAdminPage";
import AiConfigPage from "./pages/AiConfigPage";
import SettingsPage from "./pages/SettingsPage";
import ClientTypesPage from "./pages/ClientTypesPage";

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Protected><Layout /></Protected>}>
            <Route index element={<DashboardPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="employees/new" element={<EmployeeFormPage />} />
            <Route path="employees/:id" element={<EmployeeProfilePage />} />
            <Route path="evaluation/new" element={<NewEvaluationPage />} />
            <Route path="evaluation/:id" element={<QuestionnairePage />} />
            <Route path="evaluation/:id/result" element={<ResultPage />} />
            <Route path="eligibility" element={<EligibilityPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="questions" element={<QuestionsAdminPage />} />
            <Route path="client-types" element={<ClientTypesPage />} />
            <Route path="ai-config" element={<AiConfigPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
