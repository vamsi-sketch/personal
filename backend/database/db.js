import crypto from 'crypto';
import { getPool, getSupabaseClient } from './initDatabase.js';

// In-memory fallback if all external database connections fail
let tasksStore = [];
let completionsStore = [];

export const db = {
  // -------------------------------------------------------------
  // TASKS
  // -------------------------------------------------------------
  async getAllTasks() {
    // 1. Try direct PostgreSQL pool
    const pool = getPool();
    if (pool) {
      try {
        const query = `
          SELECT 
            id::text,
            name,
            COALESCE(description, '') AS description,
            COALESCE(category, 'General') AS category,
            to_char(start_date, 'YYYY-MM-DD') AS start_date,
            active,
            created_at,
            updated_at
          FROM tasks
          ORDER BY created_at ASC;
        `;
        const res = await pool.query(query);
        return res.rows;
      } catch (err) {
        console.warn('[DB] PostgreSQL getAllTasks error:', err.message);
      }
    }

    // 2. Try Supabase Client
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('id, name, description, category, start_date, active, created_at, updated_at')
          .order('created_at', { ascending: true });

        if (!error && data) {
          return data.map(t => ({
            id: String(t.id),
            name: t.name,
            description: t.description || '',
            category: t.category || 'General',
            start_date: String(t.start_date).slice(0, 10),
            active: Boolean(t.active),
            created_at: t.created_at,
            updated_at: t.updated_at,
          }));
        } else if (error) {
          console.warn('[DB] Supabase getAllTasks error:', error.message);
        }
      } catch (err) {
        console.warn('[DB] Supabase getAllTasks exception:', err.message);
      }
    }

    // 3. Fallback
    return [...tasksStore];
  },

  async getTaskById(id) {
    const pool = getPool();
    if (pool) {
      try {
        const query = `
          SELECT 
            id::text,
            name,
            COALESCE(description, '') AS description,
            COALESCE(category, 'General') AS category,
            to_char(start_date, 'YYYY-MM-DD') AS start_date,
            active,
            created_at,
            updated_at
          FROM tasks
          WHERE id = $1::uuid;
        `;
        const res = await pool.query(query, [id]);
        return res.rows[0] || null;
      } catch (err) {
        console.warn('[DB] PostgreSQL getTaskById error:', err.message);
      }
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('id, name, description, category, start_date, active, created_at, updated_at')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          return {
            id: String(data.id),
            name: data.name,
            description: data.description || '',
            category: data.category || 'General',
            start_date: String(data.start_date).slice(0, 10),
            active: Boolean(data.active),
            created_at: data.created_at,
            updated_at: data.updated_at,
          };
        }
      } catch (err) {
        console.warn('[DB] Supabase getTaskById error:', err.message);
      }
    }

    return tasksStore.find(t => t.id === id) || null;
  },

  async createTask({ name, description = '', category = 'General', start_date, active = true }) {
    const pool = getPool();
    if (pool) {
      try {
        const query = `
          INSERT INTO tasks (name, description, category, start_date, active, created_at, updated_at)
          VALUES ($1, $2, $3, $4::date, $5, NOW(), NOW())
          RETURNING 
            id::text,
            name,
            COALESCE(description, '') AS description,
            COALESCE(category, 'General') AS category,
            to_char(start_date, 'YYYY-MM-DD') AS start_date,
            active,
            created_at,
            updated_at;
        `;
        const res = await pool.query(query, [name, description, category, start_date, active]);
        return res.rows[0];
      } catch (err) {
        console.warn('[DB] PostgreSQL createTask error:', err.message);
      }
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            name,
            description: description || '',
            category: category || 'General',
            start_date,
            active: active !== undefined ? Boolean(active) : true,
          })
          .select()
          .single();

        if (!error && data) {
          console.log('[DB] Task saved directly to Supabase:', data.id);
          return {
            id: String(data.id),
            name: data.name,
            description: data.description || '',
            category: data.category || 'General',
            start_date: String(data.start_date).slice(0, 10),
            active: Boolean(data.active),
            created_at: data.created_at,
            updated_at: data.updated_at,
          };
        } else if (error) {
          console.warn('[DB] Supabase createTask error:', error.message);
        }
      } catch (err) {
        console.warn('[DB] Supabase createTask exception:', err.message);
      }
    }

    const uuid = crypto.randomUUID();
    const now = new Date().toISOString();
    const newTask = {
      id: uuid,
      name,
      description,
      category,
      start_date,
      active: active !== undefined ? Boolean(active) : true,
      created_at: now,
      updated_at: now,
    };
    tasksStore.push(newTask);
    return newTask;
  },

  async updateTask(id, fields) {
    const pool = getPool();
    if (pool) {
      try {
        const keys = Object.keys(fields);
        if (keys.length === 0) return await this.getTaskById(id);

        const setClauses = [];
        const values = [id];

        keys.forEach((k, idx) => {
          if (k === 'start_date') {
            setClauses.push(`start_date = $${idx + 2}::date`);
            values.push(fields[k]);
          } else {
            setClauses.push(`${k} = $${idx + 2}`);
            values.push(fields[k]);
          }
        });

        setClauses.push('updated_at = NOW()');

        const query = `
          UPDATE tasks
          SET ${setClauses.join(', ')}
          WHERE id = $1::uuid
          RETURNING 
            id::text,
            name,
            COALESCE(description, '') AS description,
            COALESCE(category, 'General') AS category,
            to_char(start_date, 'YYYY-MM-DD') AS start_date,
            active,
            created_at,
            updated_at;
        `;
        const res = await pool.query(query, values);
        return res.rows[0] || null;
      } catch (err) {
        console.warn('[DB] PostgreSQL updateTask error:', err.message);
      }
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const updatePayload = { ...fields, updated_at: new Date().toISOString() };
        const { data, error } = await supabase
          .from('tasks')
          .update(updatePayload)
          .eq('id', id)
          .select()
          .single();

        if (!error && data) {
          console.log('[DB] Task updated directly in Supabase:', data.id);
          return {
            id: String(data.id),
            name: data.name,
            description: data.description || '',
            category: data.category || 'General',
            start_date: String(data.start_date).slice(0, 10),
            active: Boolean(data.active),
            created_at: data.created_at,
            updated_at: data.updated_at,
          };
        }
      } catch (err) {
        console.warn('[DB] Supabase updateTask error:', err.message);
      }
    }

    const index = tasksStore.findIndex(t => t.id === id);
    if (index === -1) return null;
    const now = new Date().toISOString();
    tasksStore[index] = {
      ...tasksStore[index],
      ...fields,
      updated_at: now,
    };
    return tasksStore[index];
  },

  async deactivateTask(id) {
    return await this.updateTask(id, { active: false });
  },

  async deleteTask(id) {
    const pool = getPool();
    if (pool) {
      try {
        const query = 'DELETE FROM tasks WHERE id = $1::uuid;';
        const res = await pool.query(query, [id]);
        return res.rowCount > 0;
      } catch (err) {
        console.warn('[DB] PostgreSQL deleteTask error:', err.message);
      }
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (!error) {
          console.log('[DB] Task deleted from Supabase:', id);
          return true;
        }
      } catch (err) {
        console.warn('[DB] Supabase deleteTask error:', err.message);
      }
    }

    const initialLen = tasksStore.length;
    tasksStore = tasksStore.filter(t => t.id !== id);
    completionsStore = completionsStore.filter(c => c.task_id !== id);
    return tasksStore.length < initialLen;
  },

  // -------------------------------------------------------------
  // COMPLETIONS
  // -------------------------------------------------------------
  async getCompletions(taskId = null, month = null) {
    const pool = getPool();
    if (pool) {
      try {
        let query = `
          SELECT 
            id::text,
            task_id::text,
            to_char(completion_date, 'YYYY-MM-DD') AS completion_date,
            completed,
            created_at,
            updated_at
          FROM task_completions
          WHERE 1=1
        `;
        const params = [];

        if (taskId) {
          params.push(taskId);
          query += ` AND task_id = $${params.length}::uuid`;
        }

        if (month) {
          params.push(month);
          query += ` AND to_char(completion_date, 'YYYY-MM') = $${params.length}`;
        }

        query += ' ORDER BY completion_date ASC;';
        const res = await pool.query(query, params);
        return res.rows;
      } catch (err) {
        console.warn('[DB] PostgreSQL getCompletions error:', err.message);
      }
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let q = supabase
          .from('task_completions')
          .select('id, task_id, completion_date, completed, created_at, updated_at')
          .order('completion_date', { ascending: true });

        if (taskId) q = q.eq('task_id', taskId);
        if (month) {
          q = q.gte('completion_date', `${month}-01`).lte('completion_date', `${month}-31`);
        }

        const { data, error } = await q;
        if (!error && data) {
          return data.map(c => ({
            id: String(c.id),
            task_id: String(c.task_id),
            completion_date: String(c.completion_date).slice(0, 10),
            completed: Boolean(c.completed),
            created_at: c.created_at,
            updated_at: c.updated_at,
          }));
        }
      } catch (err) {
        console.warn('[DB] Supabase getCompletions error:', err.message);
      }
    }

    return completionsStore.filter(c => {
      if (taskId && c.task_id !== taskId) return false;
      if (month && !c.completion_date.startsWith(month)) return false;
      return true;
    });
  },

  async getCompletionsByTask(taskId) {
    return await this.getCompletions(taskId);
  },

  async upsertCompletion({ task_id, completion_date, completed }) {
    const pool = getPool();
    if (pool) {
      try {
        const query = `
          INSERT INTO task_completions (task_id, completion_date, completed, created_at, updated_at)
          VALUES ($1::uuid, $2::date, $3, NOW(), NOW())
          ON CONFLICT (task_id, completion_date)
          DO UPDATE SET 
            completed = EXCLUDED.completed, 
            updated_at = NOW()
          RETURNING 
            id::text,
            task_id::text,
            to_char(completion_date, 'YYYY-MM-DD') AS completion_date,
            completed,
            created_at,
            updated_at;
        `;
        const res = await pool.query(query, [task_id, completion_date, completed]);
        return res.rows[0];
      } catch (err) {
        console.warn('[DB] PostgreSQL upsertCompletion error:', err.message);
      }
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('task_completions')
          .upsert(
            {
              task_id,
              completion_date,
              completed: Boolean(completed),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'task_id,completion_date' }
          )
          .select()
          .single();

        if (!error && data) {
          console.log('[DB] Completion upserted directly in Supabase:', task_id, completion_date, completed);
          return {
            id: String(data.id),
            task_id: String(data.task_id),
            completion_date: String(data.completion_date).slice(0, 10),
            completed: Boolean(data.completed),
            created_at: data.created_at,
            updated_at: data.updated_at,
          };
        } else if (error) {
          console.warn('[DB] Supabase upsertCompletion error:', error.message);
        }
      } catch (err) {
        console.warn('[DB] Supabase upsertCompletion exception:', err.message);
      }
    }

    const existingIndex = completionsStore.findIndex(
      c => c.task_id === task_id && c.completion_date === completion_date
    );
    const now = new Date().toISOString();
    if (existingIndex >= 0) {
      completionsStore[existingIndex] = {
        ...completionsStore[existingIndex],
        completed: Boolean(completed),
        updated_at: now,
      };
      return completionsStore[existingIndex];
    } else {
      const newRec = {
        id: crypto.randomUUID(),
        task_id,
        completion_date,
        completed: Boolean(completed),
        created_at: now,
        updated_at: now,
      };
      completionsStore.push(newRec);
      return newRec;
    }
  },

  async getCompletionsMap(month = null) {
    const records = await this.getCompletions(null, month);
    const map = {};
    for (const c of records) {
      if (!map[c.task_id]) map[c.task_id] = {};
      map[c.task_id][c.completion_date] = c.completed;
    }
    return map;
  },

  async clearAll() {
    const pool = getPool();
    if (pool) {
      try {
        await pool.query('DELETE FROM task_completions;');
        await pool.query('DELETE FROM tasks;');
      } catch (err) {
        console.warn('[DB] PostgreSQL clearAll error:', err.message);
      }
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('task_completions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (err) {
        console.warn('[DB] Supabase clearAll error:', err.message);
      }
    }

    tasksStore = [];
    completionsStore = [];
  }
};
