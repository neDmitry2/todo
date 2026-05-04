import { supabase } from '../lib/supabase';
import { buildLocalDateTime, mergeTasksWithEvents } from '../utils/scheduleMerge';
import { twentyService } from './twentyService';

const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001';

/** Поля расписания хранятся в events, не в tasks */
const stripScheduleFields = (updates) => {
  if (!updates || typeof updates !== 'object') return updates;
  const { date, start_time, end_time, event_id, ...rest } = updates;
  return rest;
};

export const taskService = {
  async fetchTasks() {
    const [tasksRes, eventsRes] = await Promise.all([
      supabase
        .from('tasks')
        .select('*')
        .eq('user_id', MOCK_USER_ID)
        .order('created_at', { ascending: false }),
      supabase.from('events').select('*').eq('user_id', MOCK_USER_ID),
    ]);

    if (tasksRes.error) throw new Error(tasksRes.error.message);
    if (eventsRes.error) throw new Error(eventsRes.error.message);

    return mergeTasksWithEvents(tasksRes.data || [], eventsRes.data || []);
  },

  async createTask(taskData) {
    const payload = {
      ...taskData,
      user_id: MOCK_USER_ID,
    };

    const { data, error } = await supabase.from('tasks').insert([payload]).select();

    if (error) throw new Error(error.message);

    const task = data[0];
    const twenty = await twentyService.createTask(task);

    return {
      task,
      twenty,
    };
  },

  async updateTask({ id, updates }) {
    const taskUpdates = stripScheduleFields(updates);

    const { data, error } = await supabase
      .from('tasks')
      .update(taskUpdates)
      .eq('id', id)
      .eq('user_id', MOCK_USER_ID)
      .select();

    if (error) throw new Error(error.message);
    return data[0];
  },

  /**
   * Создаёт или обновляет event с привязкой к задаче (task_id).
   * start_time / end_time в БД — timestamptz (ISO).
   */
  async upsertTaskSchedule({ taskId, title, date, start_time, end_time }) {
    const start = buildLocalDateTime(date, start_time);
    const end = buildLocalDateTime(date, end_time);
    if (!start || !end || end <= start) {
      throw new Error('Некорректный интервал времени');
    }

    const { data: existing, error: findError } = await supabase
      .from('events')
      .select('id')
      .eq('user_id', MOCK_USER_ID)
      .eq('task_id', taskId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError) throw new Error(findError.message);

    const payload = {
      user_id: MOCK_USER_ID,
      task_id: taskId,
      title: title || 'Задача',
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      is_all_day: false,
    };

    if (existing?.id) {
      const { data, error } = await supabase
        .from('events')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }

    const { data, error } = await supabase.from('events').insert(payload).select().single();

    if (error) throw new Error(error.message);
    return data;
  },

  async deleteTask(id) {
    const { error: evError } = await supabase
      .from('events')
      .delete()
      .eq('task_id', id)
      .eq('user_id', MOCK_USER_ID);

    if (evError) throw new Error(evError.message);

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', MOCK_USER_ID);

    if (error) throw new Error(error.message);
    return id;
  },
};
