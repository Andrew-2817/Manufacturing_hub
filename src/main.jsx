import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClientContent } from './components/Client/ClientContent.jsx'
import { ExecutorContent } from './components/Executor/ExecutorContent.jsx'
import { DepartmentContent } from './components/Department/DepartmentContent.jsx'
import { ContextProvider } from '../context.jsx'
import './index.css'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { Login } from './components/Login.jsx'
import {AccountContent} from './components/Account/AccountUser/AccountContent.jsx'
import {AccountDepartment} from './components/Account/AccountDepartment/AccountDepartment.jsx'
import { AccountExecutor } from './components/Account/AccountExecutor/AccountExecutor.jsx'


// json-server --watch db.json --port 3001

// почистить код и вынести в компоненты
// добавить фотки в проект
// написать коментарии

const router = createBrowserRouter([
  {
    path: "/", 
    // element: <Navigate to="/login" replace />,
    element: <Navigate to="/user" replace />,
    // errorElement: <div className="">404</div>
  },
  {
    path: "/user", 
    element: <ContextProvider><ClientContent/></ContextProvider>, 
    errorElement: <div className="">404</div>
  },
  {
    path: "/login", 
    element: <ContextProvider><Login/></ContextProvider>, 
    errorElement: <div className="">404</div>
  },
  {
    path: "/executor", 
    element: <ContextProvider><ExecutorContent/></ContextProvider>, 
    errorElement: <div className="">404</div>
  },
  {
    path: "/department", 
    element: <ContextProvider><DepartmentContent/></ContextProvider>, 
    errorElement: <div className="">404</div>
  },
  {
    path: "/user/account", 
    element: <ContextProvider><AccountContent/></ContextProvider>, 
    errorElement: <div className="">404</div>
  },
  {
    path: "/executor/account", 
    element: <ContextProvider><AccountExecutor/></ContextProvider>, 
    errorElement: <div className="">404</div>
  },
  {
    path: "/department/account", 
    element: <ContextProvider><AccountDepartment/></ContextProvider>, 
    errorElement: <div className="">404</div>
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
