const TWENTY_API_URL = (
  import.meta.env.VITE_TWENTY_API_URL || 'https://api.twenty.com/rest'
).replace(/\/$/, '');
const TWENTY_API_KEY = import.meta.env.VITE_TWENTY_API_KEY;

const buildTwentyTaskPayload = (task) => {
  const description = task.description?.trim();
  const dueAt = task.dueAt || task.due_at || task.due_date || null;
  const categoryId = task.category_id?.trim?.() || task.category_id;
  const userId = task.user_id?.trim?.() || task.user_id;
  const payload = {
    title: task.title,
    status: task.is_completed ? 'DONE' : 'TODO',
  };

  if (description) {
    payload.bodyV2 = {
      markdown: description,
    };
  }

  if (dueAt) {
    payload.dueAt = dueAt;
  }

  if (categoryId) {
    payload.categoryId = categoryId;
  }

  if (userId) {
    payload.userId = userId;
  }

  return payload;
};

const readTwentyError = async (response) => {
  const fallback = response.statusText || 'Twenty CRM request failed';

  try {
    const body = await response.json();
    return (
      body?.errors?.[0]?.message ||
      body?.error?.message ||
      body?.error ||
      body?.message ||
      fallback
    );
  } catch {
    return fallback;
  }
};

export const twentyService = {
  async createTask(task) {
    if (!TWENTY_API_KEY) {
      return {
        status: 'configuration_error',
        error: 'Missing VITE_TWENTY_API_KEY environment variable',
      };
    }

    try {
      const response = await fetch(`${TWENTY_API_URL}/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TWENTY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildTwentyTaskPayload(task)),
      });

      if (!response.ok) {
        return {
          status: response.status,
          error: await readTwentyError(response),
        };
      }

      return {
        status: response.status,
      };
    } catch (error) {
      return {
        status: 'network_error',
        error: error?.message || 'Twenty CRM request failed',
      };
    }
  },
};
