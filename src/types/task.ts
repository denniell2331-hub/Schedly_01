export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  deadline: string;
  completed: boolean;
}                                                                                               