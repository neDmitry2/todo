import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Главная', icon: '🏠' },
  { to: '/calendar', label: 'Календарь', icon: '📅' },
  { to: '/tasks', label: 'Задачи', icon: '✅' },
  { to: '/stats', label: 'Статистика', icon: '📊' },
];

export default function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t bg-white p-2 shadow-[0_-1px_6px_rgba(0,0,0,0.06)]">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          title={tab.label}
          end={tab.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center text-sm py-1 px-2 rounded ${
              isActive ? 'text-blue-600' : 'text-black/60'
            }`
          }
        >
          <span className="text-xl">{tab.icon}</span>
          <span className="text-[10px] mt-1">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
