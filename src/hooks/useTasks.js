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
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      const previousTasks = queryClient.getQueryData(['tasks']);

      queryClient.setQueryData(['tasks'], (oldTasks = []) =>
        oldTasks.map((task) =>
          task.id === id
            ? {
                ...task,
                ...updates,
              }
            : task,
        ),
      );

      return { previousTasks };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
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

  // 5. Расписание: запись в events (task_id)
  const scheduleMutation = useMutation({
    mutationFn: taskService.upsertTaskSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    createTask: createMutation.mutate,
    isCreating: createMutation.isPending,
    updateTask: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    deleteTask: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    upsertTaskSchedule: scheduleMutation.mutate,
    isScheduling: scheduleMutation.isPending,
  };
};