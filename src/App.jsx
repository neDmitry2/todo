import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CalendarView from './pages/CalendarView';
import TaskList from './pages/TaskList';
import Statistics from './pages/Statistics';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 pb-20">
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