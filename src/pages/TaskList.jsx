import { useState } from 'react';
import TaskItem from '../components/TaskItem';
import TaskEditSheet from '../components/TaskEditSheet';
import FAB from '../components/ui/FAB';
import { useTasks } from '../hooks/useTasks';
import { useNavigate, useLocation } from 'react-router-dom';

const TaskList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    tasks,
    isLoading,
    isError,
    updateTask,
    deleteTask,
    isUpdating,
    isDeleting,
  } = useTasks();
  const [editingTask, setEditingTask] = useState(null);

  const handleToggleTask = (id, isCompleted) => {
    updateTask({
      id,
      updates: {
        is_completed: isCompleted,
      },
    });
  };

  if (isLoading) return <div>Загрузка...</div>;
  if (isError) return <div>Не удалось загрузить задачи</div>;

  return (
    <div className="p-4 pb-32">
      <h1 className="text-2xl font-bold mb-6">Мои задачи</h1>

      {tasks.length === 0 ? (
        <p className="text-black">Пока нет задач. Добавьте первую.</p>
      ) : (
        tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={handleToggleTask}
            onEdit={() => setEditingTask(task)}
            onSchedule={() =>
              navigate(`/tasks/${task.id}/schedule`, {
                state: { from: location.pathname },
              })
            }
          />
        ))
      )}

      <TaskEditSheet
        task={editingTask}
        open={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        updateTask={updateTask}
        deleteTask={deleteTask}
        isUpdating={isUpdating}
        isDeleting={isDeleting}
        scheduleReturnPath="/tasks"
      />

      <FAB onClick={() => navigate('/tasks/new')} />
    </div>
  );
};

export default TaskList;