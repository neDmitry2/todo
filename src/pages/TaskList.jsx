import TaskItem from '../components/TaskItem';
import FAB from '../components/ui/FAB';
import { useTasks } from '../hooks/useTasks';

const TaskList = () => {
  const { tasks, isLoading, updateTask } = useTasks();

  if (isLoading) return <div>Загрузка...</div>;

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