import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ sidebarItems, section, children, resetProgress }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar sidebarItems={sidebarItems} section={section} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header section={section} sidebarItems={sidebarItems} onResetTutorial={resetProgress}/>
        <div className="flex-1 overflow-auto p-4">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
