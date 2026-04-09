import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/taskService';

export const useTasks = () => {
  const queryClient = useQueryClient();

  // 1. Получение задач
  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.fetchTasks,
  });

  // 2. Создание задачи
  const createMutation = useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      // Заставляем React Query перекачать список задач
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // 3. Обновление задачи (например, чекбокс)
  const updateMutation = useMutation({
    mutationFn: taskService.updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // 4. Удаление задачи
  const deleteMutation = useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    createTask: createMutation.mutate,
    updateTask: updateMutation.mutate,
    deleteTask: deleteMutation.mutate,
  };
};