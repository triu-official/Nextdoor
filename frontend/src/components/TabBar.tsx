import { NavLink } from 'react-router-dom';

export function TabBar() {
  return (
    <nav className="tab-bar">
      <NavLink to="/feed" className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
        Local Feed
      </NavLink>
      <NavLink to="/nearby" className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
        New Nearby
      </NavLink>
      <NavLink to="/circles" className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
        Community Circles
      </NavLink>
    </nav>
  );
}
