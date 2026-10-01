import React, { useEffect, useState } from 'react';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Building,
  Plus,
} from 'lucide-react';
import { tasksApi } from '../api';
import { Task, TaskPriority, TaskStatus } from '../types';
import { PageHeader } from '../components/common/PageHeader';
import { Tabs } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingSkeleton, EmptyState } from '../components/ui/FeedbackStates';

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<string>('today');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('High');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-10-02');
  const [newTaskCompany, setNewTaskCompany] = useState('');

  const fetchTasks = async () => {
    try {
      const data = await tasksApi.getTasks();
      setTasks(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleTaskStatus = async (task: Task) => {
    const newStatus: TaskStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    await tasksApi.updateTask(task.id, { status: newStatus });
    fetchTasks();
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await tasksApi.createTask({
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      companyName: newTaskCompany.trim() || undefined,
      status: 'Pending',
      actionType: 'Review Application',
    });
    setNewTaskTitle('');
    setShowCreateModal(false);
    fetchTasks();
  };

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === 'today') return t.status !== 'Completed' && (t.dueDate === '2026-10-01' || t.dueDate === '2026-10-02');
    if (activeTab === 'upcoming') return t.status !== 'Completed' && t.dueDate > '2026-10-02';
    if (activeTab === 'overdue') return t.status === 'Overdue' || (t.status !== 'Completed' && t.dueDate < '2026-10-01');
    if (activeTab === 'completed') return t.status === 'Completed';
    return true;
  });

  if (isLoading) {
    return <LoadingSkeleton lines={8} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks & Action Queue"
        subtitle="Prioritized checklist of recruiter emails, application reviews, and interview milestones"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Create Task
          </Button>
        }
      />

      {/* Tabs */}
      <Tabs
        variant="pills"
        tabs={[
          { id: 'today', label: 'Due Today / Soon', count: tasks.filter((t) => t.status !== 'Completed' && (t.dueDate === '2026-10-01' || t.dueDate === '2026-10-02')).length },
          { id: 'upcoming', label: 'Upcoming', count: tasks.filter((t) => t.status !== 'Completed' && t.dueDate > '2026-10-02').length },
          { id: 'overdue', label: 'Overdue', count: tasks.filter((t) => t.status === 'Overdue' || (t.status !== 'Completed' && t.dueDate < '2026-10-01')).length },
          { id: 'completed', label: 'Completed', count: tasks.filter((t) => t.status === 'Completed').length },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Task List */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        {filteredTasks.length === 0 ? (
          <EmptyState
            title="No tasks in this view"
            description="You are caught up with this queue! Check other tabs or create a new task."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((t) => {
              const isDone = t.status === 'Completed';

              return (
                <div
                  key={t.id}
                  className={`p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4 text-xs ${
                    isDone ? 'opacity-60 bg-slate-50/40' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => handleToggleTaskStatus(t)}
                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-blue-500'
                      }`}
                      aria-label="Toggle completed"
                    >
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-semibold text-sm ${
                            isDone ? 'line-through text-slate-500' : 'text-[#0F172A]'
                          }`}
                        >
                          {t.title}
                        </span>
                        <Badge
                          variant={
                            t.priority === 'High' ? 'red' : t.priority === 'Medium' ? 'amber' : 'gray'
                          }
                          size="sm"
                        >
                          {t.priority}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-[#64748B] text-[11px] flex-wrap">
                        {t.companyName && (
                          <span className="font-medium text-slate-700">{t.companyName}</span>
                        )}
                        {t.jobTitle && (
                          <>
                            <span>·</span>
                            <span className="truncate max-w-[200px]">{t.jobTitle}</span>
                          </>
                        )}
                        <span>·</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3 h-3" />
                          <span>Due: {t.dueDate}</span>
                        </span>
                      </div>

                      {t.description && (
                        <p className="text-[11px] text-[#475569] pt-0.5">{t.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase tracking-wider">
                      {t.actionType}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Action Task"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleCreateTask}>
                Save Task
              </Button>
            </div>
          }
        >
          <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#64748B] font-medium mb-1">Task Title</label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. Review updated CV for Zalando..."
                className="w-full p-2 bg-slate-50 border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#64748B] font-medium mb-1">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                  className="w-full p-2 bg-slate-50 border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-[#64748B] font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-[#E2E8F0] rounded-lg text-[#0F172A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#64748B] font-medium mb-1">Company (Optional)</label>
              <input
                type="text"
                value={newTaskCompany}
                onChange={(e) => setNewTaskCompany(e.target.value)}
                placeholder="e.g. Delivery Hero, N26..."
                className="w-full p-2 bg-slate-50 border border-[#E2E8F0] rounded-lg text-[#0F172A]"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
