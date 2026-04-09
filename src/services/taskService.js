import { supabase } from '../lib/supabase';

export const taskService = {
  // Получить все задачи (сортировка по дате создания)
  async fetchTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data;
  },

  // Создать новую задачу
  async createTask(taskData) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select();

    if (error) throw new Error(error.message);
    return data[0];
  },

  // Обновить задачу (статус или данные)
  async updateTask({ id, updates }) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw new Error(error.message);
    return data[0];
  },

  // Удалить задачу
  async deleteTask(id) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return id;
  }
};