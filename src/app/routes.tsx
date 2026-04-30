import React from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { AuthLayout } from "./Layout";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { EnterpriseDashboard } from "./pages/EnterpriseDashboard";
import { EnterpriseTasks } from "./pages/EnterpriseTasks";
import { TaskPublish } from "./pages/TaskPublish";
import { TalentSearch } from "./pages/TalentSearch";
import { ContractWorkspace } from "./pages/ContractWorkspace";
import { ContractChat } from "./pages/ContractChat";
import { TalentDashboard } from "./pages/TalentDashboard";
import { AcceptanceCenter } from "./pages/AcceptanceCenter";
import { FinanceRecords } from "./pages/FinanceRecords";
import { TaskSquare } from "./pages/TaskSquare";
import { EnterpriseRecruiting } from "./pages/EnterpriseRecruiting";
import { TalentDetails } from "./pages/TalentDetails";
import { EnterpriseRecordDetails } from "./pages/EnterpriseRecordDetails";
import { EnterpriseSettlement } from "./pages/EnterpriseSettlement";
import { TaskDetails } from "./pages/TaskDetails";
import { TaskApply } from "./pages/TaskApply";
import { TalentRecordDetails } from "./pages/TalentRecordDetails";
import { EnterpriseOnboarding } from "./pages/EnterpriseOnboarding";
import { TalentOnboarding } from "./pages/TalentOnboarding";
import { EnterpriseNotifications } from "./pages/EnterpriseNotifications";
import { TalentNotifications } from "./pages/TalentNotifications";
import { EnterpriseApprovals } from "./pages/EnterpriseApprovals";
import { EnterpriseAssistant } from "./pages/EnterpriseAssistant";
import { TalentAssistant } from "./pages/TalentAssistant";
import { EnterpriseContracts } from "./pages/EnterpriseContracts";
import { EnterpriseReports } from "./pages/EnterpriseReports";
import { EnterpriseBilling } from "./pages/EnterpriseBilling";
import { TalentSettlement } from "./pages/TalentSettlement";
import { TalentAcceptance } from "./pages/TalentAcceptance";

// Mock empty pages for routing structure completeness
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
      <span className="text-2xl">🚧</span>
    </div>
    <h2 className="text-xl font-semibold text-slate-700">{title}</h2>
    <p className="text-sm mt-2">高保真页面建设中，可通过左侧导航或主流程体验核心功能。</p>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/auth",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Navigate to="/auth" replace />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/enterprise/onboarding",
    element: <EnterpriseOnboarding />,
  },
  {
    path: "/talent/onboarding",
    element: <TalentOnboarding />,
  },
  {
    path: "/enterprise",
    element: <AuthLayout />,
    children: [
      { index: true, element: <EnterpriseDashboard /> },
      { path: "tasks", element: <EnterpriseTasks /> },
      { path: "publish", element: <TaskPublish /> },
      { path: "talents", element: <TalentSearch /> },
      { path: "talents/:slug", element: <TalentDetails /> },
      { path: "recruiting", element: <EnterpriseRecruiting /> },
      { path: "notifications", element: <EnterpriseNotifications /> },
      { path: "approvals", element: <EnterpriseApprovals /> },
      { path: "assistant", element: <EnterpriseAssistant /> },
      { path: "workspace", element: <ContractWorkspace /> },
      { path: "contracts", element: <EnterpriseContracts /> },
      { path: "reports", element: <EnterpriseReports /> },
      { path: "billing", element: <EnterpriseBilling /> },
      { path: "chat", element: <ContractChat /> },
      { path: "acceptance", element: <AcceptanceCenter /> },
      { path: "records", element: <FinanceRecords /> },
      { path: "records/:recordId", element: <EnterpriseRecordDetails /> },
      { path: "settlement", element: <EnterpriseSettlement /> },
      { path: "records/:recordId/settlement", element: <EnterpriseSettlement /> },
      { path: "*", element: <Placeholder title="企业端功能模块" /> },
    ],
  },
  {
    path: "/talent",
    element: <AuthLayout />,
    children: [
      { index: true, element: <TalentDashboard /> },
      { path: "tasks", element: <TaskSquare /> },
      { path: "tasks/:taskId", element: <TaskDetails /> },
      { path: "tasks/:taskId/apply", element: <TaskApply /> },
      { path: "notifications", element: <TalentNotifications /> },
      { path: "assistant", element: <TalentAssistant /> },
      { path: "workspace", element: <ContractWorkspace /> },
      { path: "chat", element: <ContractChat /> },
      { path: "acceptance", element: <TalentAcceptance /> },
      { path: "records", element: <FinanceRecords /> },
      { path: "records/:recordId", element: <TalentRecordDetails /> },
      { path: "settlement", element: <TalentSettlement /> },
      { path: "records/:recordId/settlement", element: <TalentSettlement /> },
      { path: "*", element: <Placeholder title="人才端功能模块" /> },
    ],
  },
]);
