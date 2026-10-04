import { apiClient } from './client';
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
    return await apiClient.get<Task[]>('/tasks', { params: params as any });
  },

  async getTask(id: string): Promise<Task | null> {
    try {
      return await apiClient.get<Task>(`/tasks/${id}`);
    } catch (err: any) {
      if (err.status === 404) return null;
      throw err;
    }
  },

  async createTask(newTask: Omit<Task, 'id'> | Partial<Task>): Promise<Task> {
    return await apiClient.post<Task>('/tasks', newTask);
  },

  async updateTask(id: string, update: Partial<Task>): Promise<Task> {
    return await apiClient.patch<Task>(`/tasks/${id}`, update);
  },
};

