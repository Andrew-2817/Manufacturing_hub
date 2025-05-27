import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClientContent } from './components/Client/ClientContent.jsx';
import { ExecutorContent } from './components/Executor/ExecutorContent.jsx';
import { DepartmentContent } from './components/Department/DepartmentContent.jsx';
import { ContextProvider, useTRPS } from '../context.jsx';
import './index.css';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Login } from './components/Login.jsx';
import {AccountContent} from './components/Account/AccountUser/AccountContent.jsx';
import {AccountDepartment} from './components/Account/AccountDepartment/AccountDepartment.jsx';
import { AccountExecutor } from './components/Account/AccountExecutor/AccountExecutor.jsx';

import { App, Spin } from 'antd';

// ИМПОРТИРУЕМ ФАЙЛ КОНФИГУРАЦИИ AXIOS ОДИН РАЗ ЗДЕСЬ
import './api/axiosConfig.js';


const router = createBrowserRouter([
// ... (определение маршрутов, компонент ProtectedRoute не изменился) ...
  {
    path: "/",
    element: <Navigate to="/user" replace />,
    errorElement: <div className="">404</div>
  },
  {
    path: "/user",
    element: <ClientContent/>,
    errorElement: <div className="">404</div>
  },
  {
    path: "/login",
    element: <Login/>,
    errorElement: <div className="">404</div>
  },
  {
    path: "/executor",
    element: <ExecutorContent/>,
    errorElement: <div className="">404</div>
  },
  {
    path: "/department",
    element: <DepartmentContent/>,
    errorElement: <div className="">404</div>
  },

  // Защищенные маршруты личных кабинетов
  {
    path: "/user/account",
    element: <ProtectedRoute element={<AccountContent/>} allowedRoles={['user']} />,
    errorElement: <div className="">404</div>
  },
  {
    path: "/executor/account",
    element: <ProtectedRoute element={<AccountExecutor/>} allowedRoles={['executor']} />,
    errorElement: <div className="">404</div>
  },
  {
    path: "/department/account",
    element: <ProtectedRoute element={<AccountDepartment/>} allowedRoles={['department']} />,
    errorElement: <div className="">404</div>
  },
]);

// Вспомогательный компонент для проверки роли и редиректа (перенесен выше)
function ProtectedRoute({ element, allowedRoles }) {
    const { currentUser, loading } = useTRPS();

    if (loading) {
        return (
             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Spin size="large" tip="Loading user data..." />
            </div>
        );
    }

    if (!currentUser) {
        console.log("ProtectedRoute: Not authenticated, redirecting to /login");
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        console.log(`ProtectedRoute: Role "${currentUser.role}" not allowed for this route.`);
        if (currentUser.role === 'user') {
             console.log("Redirecting to /user/account");
             return <Navigate to="/user/account" replace />;
        } else if (currentUser.role === 'department') {
             console.log("Redirecting to /department/account");
             return <Navigate to="/department/account" replace />;
        } else if (currentUser.role === 'executor') {
             console.log("Redirecting to /executor/account");
             return <Navigate to="/executor/account" replace />;
        }
        console.log("Redirecting to /login due to unknown role or unhandled case");
        return <Navigate to="/login" replace />;

    }

    console.log(`ProtectedRoute: Role "${currentUser.role}" allowed, rendering route.`);
    return element;
}


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App>
      <ContextProvider>
        <RouterProvider router={router}/>
      </ContextProvider>
    </App>
  </StrictMode>,
);