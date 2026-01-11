
export interface Message {
  role: 'user' | 'model';
  content: string;
}

export interface TrafficDataPoint {
  time: string;
  actual: number;
  predicted: number;
}

export interface TrafficSimulationResult {
  scenario: string;
  studentCount: number;
  data: TrafficDataPoint[];
  insight: string;
}

export enum Tab {
  VISUALIZER = 'visualizer',
  PLAYGROUND = 'playground',
  PYTHON_LAB = 'python_lab',
  FLOWCHART = 'flowchart'
}

export interface CodeSnippet {
  title: string;
  description: string;
  code: string;
}
