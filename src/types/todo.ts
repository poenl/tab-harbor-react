export interface Todo {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  completed: boolean;
  completedAt: string | null;
  dismissed: boolean;
}

export interface SplitTodosResult {
  active: Todo[];
  archived: Todo[];
}
