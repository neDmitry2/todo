import TaskItem from '../components/TaskItem';
import FAB from '../components/ui/FAB';

const TaskList = () => {
  const tasks = [
    { id: 1, title: 'Купить продукты', is_completed: false },
    { id: 2, title: 'Встреча с командой', is_completed: true, start_time: '14:00', end_time: '15:00' },
  ];

  return (
    <div className="p-4 pb-32">
      <h1 className="text-2xl font-bold mb-6">Мои задачи</h1>
      
      {tasks.map(task => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onToggle={(id, status) => console.log('Update task', id, status)} 
        />
      ))}

      <FAB onClick={() => console.log('Open Add Task Modal')} />
    </div>
  );
};

export default TaskList;