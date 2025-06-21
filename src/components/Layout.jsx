// import Sidebar from './Sidebar';
// import Header from './Header';

// const Layout = ({
//   children,
//   sidebarItems,
//   currentPage,
//   setCurrentPage,
//   selectedPatient,
//   setSelectedPatient,
//   selectedInvoice,
//   setSelectedInvoice,
// }) => {
//   return (
//     <div className="flex h-screen overflow-hidden bg-gray-50">
//       <Sidebar
//         sidebarItems={sidebarItems}
//         currentPage={currentPage}
//         setCurrentPage={setCurrentPage}
//         setSelectedPatient={setSelectedPatient}
//         setSelectedInvoice={setSelectedInvoice}
//       />
//       <main className="flex-1 flex flex-col overflow-hidden">
//         <Header currentPage={currentPage} />
//         <div className="flex-1 overflow-auto p-4">
//           {children}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Layout;

// components/Layout.jsx
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ sidebarItems, children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar sidebarItems={sidebarItems} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-auto p-4">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
