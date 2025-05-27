import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClientContent } from './components/Client/ClientContent.jsx';
import { ExecutorContent } from './components/Executor/ExecutorContent.jsx';
import { DepartmentContent } from './components/Department/DepartmentContent.jsx';
import { ContextProvider } from '../context.jsx';
import './index.css';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Login } from './components/Login.jsx';
import {AccountContent} from './components/Account/AccountUser/AccountContent.jsx';
import {AccountDepartment} from './components/Account/AccountDepartment/AccountDepartment.jsx';
import { AccountExecutor } from './components/Account/AccountExecutor/AccountExecutor.jsx';

// Импортируем компонент App из antd
import { App } from 'antd';


// json-server --watch db.json --port 3001

// почистить код и вынести в компоненты
// добавить фотки в проект
// написать коментарии

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/user" replace />,
    errorElement: <div className="">404</div> // ErrorBoundary или errorElement для RouterProvider
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
  {
    path: "/user/account",
    element: <AccountContent/>,
    errorElement: <div className="">404</div>
  },
  {
    path: "/executor/account",
    element: <AccountExecutor/>,
    errorElement: <div className="">404</div>
  },
  {
    path: "/department/account",
    element: <AccountDepartment/>,
    errorElement: <div className="">404</div>
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App>
      <ContextProvider>
        <RouterProvider router={router}/>
      </ContextProvider>
    </App>
  </StrictMode>,
);