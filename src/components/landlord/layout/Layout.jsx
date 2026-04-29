import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

export default function Layout() {
  return (
    <div className="min-h-screen flex" style={{ background: '#F0F4FF' }}>
      <Sidebar />
      <main className="flex-1 lg:ml-64 min-w-0">
        <div className="px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 pb-24 lg:pb-10 page-enter">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
