import { apiClient } from './client';
import { store } from './store';
import { Task } from '../types';

export interface TaskFilterParams {
  status?: string;
  priority?: string;
  jobId?: string;
  limit?: number;
  skip?: number;
}

export const tasksApi = {
  async getTasks(params?: TaskFilterParams): Promise<Task[]> {
    try {
      return await apiClient.get<Task[]>('/tasks', { params: params as any });
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      console.warn('Tasks API call failed, falling back to mock store:', err);
      let tasks = store.getTasks();
      if (params?.status && params.status !== 'all') {
        tasks = tasks.filter((t) => t.status === params.status);
      }
      return tasks;
    }
  },

  async getTask(id: string): Promise<Task | null> {
    try {
      return await apiClient.get<Task>(`/tasks/${id}`);
    } catch (err: any) {
      if (err.status === 404) return null;
      if (import.meta.env.PROD) throw err;
      const all = store.getTasks();
      return all.find((t) => t.id === id) || null;
    }
  },

  async createTask(newTask: Omit<Task, 'id'> | Partial<Task>): Promise<Task> {
    try {
      return await apiClient.post<Task>('/tasks', newTask);
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return store.createTask(newTask as Omit<Task, 'id'>);
    }
  },

  async updateTask(id: string, update: Partial<Task>): Promise<Task> {
    try {
      return await apiClient.patch<Task>(`/tasks/${id}`, update);
    } catch (err) {
      if (import.meta.env.PROD) throw err;
      return store.updateTask(id, update);
    }
  },
};
