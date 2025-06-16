import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, currentPage, setCurrentPage, selectedPatient, setSelectedPatient, selectedInvoice, setSelectedInvoice }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        setSelectedPatient={setSelectedPatient}
        setSelectedInvoice={setSelectedInvoice}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header currentPage={currentPage} />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
