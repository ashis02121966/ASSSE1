import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/auth/LoginForm';
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import FrameUpload from './components/frame/FrameUpload';
import FrameAllocation from './components/frame/FrameAllocation';
import GenerateNotice from './components/notice/GenerateNotice';
import SurveyManagement from './components/survey/SurveyManagement';
import ScrutinyManagement from './components/scrutiny/ScrutinyManagement';
import DataDownload from './components/data/DataDownload';
import Reports from './components/reports/Reports';
import Settings from './components/settings/Settings';
import UserManagement from './components/masterdata/UserManagement';
import RoleManagement from './components/masterdata/RoleManagement';
import RoleMenuAccess from './components/masterdata/RoleMenuAccess';
import SurveyConfiguration from './components/masterdata/SurveyConfiguration';
import ApprovalWorkflowManagement from './components/masterdata/ApprovalWorkflowManagement';
import { Loader2 } from 'lucide-react';

function App() {
  const { user, loading, login, userMenuItems } = useAuth();
  const [currentPage, setCurrentPage] = useState('/dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg text-gray-700">Loading ASSSE System...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={login} loading={loading} />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case '/dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case '/frame-upload':
        return <FrameUpload />;
      case '/frame-allocation':
        return <FrameAllocation />;
      case '/generate-notice':
        return <GenerateNotice />;
      case '/survey-management':
        return <SurveyManagement />;
      case '/scrutiny-management':
        return <ScrutinyManagement />;
      case '/data-download':
        return <DataDownload />;
      case '/reports':
        return <Reports />;
      case '/settings':
        return <Settings />;
      case '/master-data/user-management':
        return <UserManagement />;
      case '/master-data/survey-config':
        return <SurveyConfiguration />;
      case '/master-data/role-management':
        return <RoleManagement />;
      case '/master-data/menu-access':
        return <RoleMenuAccess />;
      case '/master-data/approval-workflow':
        return <ApprovalWorkflowManagement />;
      default:
        return (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {currentPage.replace(/^\//, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h2>
            <p className="text-gray-600">
              This module is under development. Please check back later.
            </p>
          </div>
        );
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderCurrentPage()}
    </Layout>
  );
}

export default App;