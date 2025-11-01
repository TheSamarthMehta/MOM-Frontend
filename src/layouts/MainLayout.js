import React, { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import SideBar from './SideBar';
import { getPageTitle } from '../shared/constants/routeConfig';

const MainLayout = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const title = useMemo(() => getPageTitle(pathname), [pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onMenuClick={() => setOpen(true)}
        onProfileClick={() => navigate('/profile')}
        title={title}
      />

      <div className="pt-20">
        <div className={`fixed left-0 right-0 top-20 bottom-0 z-40 ${open ? '' : 'pointer-events-none'}`}>
          <div
            className={`absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setOpen(false)}
          />
          <div className={`absolute left-0 top-0 bottom-0 transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="w-72 max-w-[80vw] h-full bg-white shadow-strong">
              <SideBar
                navigate={(path) => {
                  navigate(path);
                  setOpen(false);
                }}
              />
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
