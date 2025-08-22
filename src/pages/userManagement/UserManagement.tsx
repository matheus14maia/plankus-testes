import React, { useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import Topbar from "../../components/topbar/Topbar";
import Sidebar from "../../components/sidebar/Sidebar";
import UsersManagement from '../../components/users/UsersManagement';
import './UserManagement.css';

const UserManagement: React.FC = () => {
  const { isAuthenticated } = useAuth0();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  if (!isAuthenticated) {
    return <p>Você precisa estar logado para acessar esta página.</p>;
  }

  return (
    <div id="user-management-screen" className="user-management-container">
      <div id="user-management-topbar-container">
        <Topbar toggleSidebar={toggleSidebar} />
      </div>
      <div className="user-management-main-content">
        <div className={isSidebarOpen ? "manage-sidebar-open" : "manage-sidebar-closed"}>
          <Sidebar isOpen={isSidebarOpen} />
        </div>
        <div className="user-management-content-area">  
          <UsersManagement />
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
