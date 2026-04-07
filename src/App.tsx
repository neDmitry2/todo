import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CalendarView from './pages/CalendarView';
import TaskList from './pages/TaskList';
import Statistics from './pages/Statistics';

// Простой компонент навигации (временный, до выполнения задачи 2.3)
const Navbar = () => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3">
    <Link title="Главная" to="/" className="text-blue-500">🏠</Link>
    <Link title="Календарь" to="/calendar" className="text-blue-500">📅</Link>
    <Link title="Задачи" to="/tasks" className="text-blue-500">✅</Link>
    <Link title="Статистика" to="/stats" className="text-blue-500">📊</Link>
  </nav>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 pb-20"> {/* pb-20 чтобы контент не перекрывался навбаром */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/stats" element={<Statistics />} />
        </Routes>
        
        <Navbar />
      </div>
    </Router>
  );
}

export default App;