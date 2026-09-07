export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface Metric {
  id: string;
  name: string;
  value: number | string | null;
  unit?: string;
  period?: string;
  change?: number | null; // percentage change e.g. -0.12 or +0.15
  comparisonPeriod?: string;
}

export interface Trend {
  id: string;
  title: string;
  description: string;
  direction: 'up' | 'down' | 'flat';
  impact: 'positive' | 'negative' | 'neutral';
  metricId?: string;
}

export interface Anomaly {
  id: string;
  metric: string;
  description: string;
  severity: Severity;
  detectedPeriod?: string;
  magnitude?: number;
  confidence?: number;
}

export interface Insight {
  id: string;
  observation: string;
  interpretation: string;
  confidence: number; // 0 to 1
  category?: string;
}

export interface ChartDataPoint {
  [key: string]: string | number | null;
}

export type ChartType = 'line' | 'bar' | 'area' | 'donut' | 'sparkline';

export interface ChartDefinition {
  id: string;
  type: ChartType;
  title: string;
  description?: string;
  xAxisKey?: string;
  dataKeys?: string[];
  data: ChartDataPoint[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionableStep?: string;
}

export interface ReportData {
  title: string;
  summary: string;
  confidence?: number;
  metrics: Metric[];
  trends: Trend[];
  anomalies: Anomaly[];
  insights: Insight[];
  charts: ChartDefinition[];
  recommendations: Recommendation[];
  rawData?: Record<string, any>[];
  metadata: {
    sourceCount: number;
    generatedAt: string;
    schemaVersion: string;
    fileNames?: string[];
  };
}

export type ReportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Report {
  id: string;
  user_id: string;
  title: string;
  status: ReportStatus;
  summary?: string;
  report_json?: ReportData;
  source_file_ids?: string[];
  schema_version: string;
  created_at: string;
  updated_at: string;
}

export interface UploadedFile {
  id: string;
  user_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  upload_status: 'pending' | 'complete' | 'failed';
  created_at: string;
}

export interface ChatMessage {
  id: string;
  report_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  structured_response?: {
    text?: string;
    visualization?: ChartDefinition;
  } | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
}
