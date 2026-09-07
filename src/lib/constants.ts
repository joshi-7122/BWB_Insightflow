export const MAX_FILE_SIZE_MB = Number(import.meta.env.VITE_MAX_FILE_SIZE_MB ?? 25);
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_FILES_PER_ANALYSIS = Number(import.meta.env.VITE_MAX_FILES ?? 5);

export const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls', '.png', '.jpg', '.jpeg', '.webp'];

export const ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'image/png',
  'image/jpeg',
  'image/webp',
];

export const DEMO_REPORT: import('@/types').Report = {
  id: 'demo-report-q2-revenue',
  user_id: 'demo-user-123',
  title: 'Business Analytics & Performance Report',
  status: 'completed',
  summary: 'Overall revenue increased by 14.2% in the recent quarter, reaching $1.42M. Client retention remained solid at 94.8%, while acquisition costs dropped by 8% due to organic channel growth.',
  schema_version: '1.0',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  report_json: {
    title: 'Business Analytics & Performance Report',
    summary: 'Overall revenue increased by 14.2% in the recent quarter, reaching $1.42M. Client retention remained solid at 94.8%, while acquisition costs dropped by 8% due to organic channel growth.',
    confidence: 0.94,
    metrics: [
      { id: 'm1', name: 'Annual Recurring Revenue', value: 1420000, unit: 'USD', period: 'Q2 2026', change: 0.142, comparisonPeriod: 'vs Q1 2026' },
      { id: 'm2', name: 'Net Dollar Retention', value: '108%', period: 'Q2 2026', change: -0.035, comparisonPeriod: 'vs Q1 2026' },
      { id: 'm3', name: 'Customer Acquisition Cost', value: 420, unit: 'USD', period: 'Q2 2026', change: -0.08, comparisonPeriod: 'vs Q1 2026' },
      { id: 'm4', name: 'Active Subscriptions', value: 1240, period: 'Q2 2026', change: 0.065, comparisonPeriod: 'vs Q1 2026' },
    ],
    trends: [
      { id: 't1', title: 'Enterprise Expansion Accelerating', description: 'Enterprise accounts generated $180k in expansion revenue, up 28% YoY.', direction: 'up', impact: 'positive' },
      { id: 't2', title: 'SMB Tier Churn Spike', description: 'SMB churn rose from 2.1% to 4.8% following the March pricing tier adjustments.', direction: 'down', impact: 'negative' },
      { id: 't3', title: 'CAC Efficiency Improved', description: 'Blended CAC decreased by 8% due to higher organic inbound conversion from product webinars.', direction: 'down', impact: 'positive' }
    ],
    anomalies: [
      { id: 'a1', metric: 'March SMB Cancellation Count', description: 'Unusual cancellation spike of 42 accounts in week 3 of March immediately following tier updates.', severity: 'high', detectedPeriod: 'March 2026', magnitude: 2.3, confidence: 0.91 },
      { id: 'a2', metric: 'Lead-to-Paid Conversion Velocity', description: 'Conversion window shortened from 14 days to 6 days during mid-April promo campaign.', severity: 'medium', detectedPeriod: 'April 2026', magnitude: 1.8, confidence: 0.88 }
    ],
    charts: [
      {
        id: 'c1',
        type: 'area',
        title: 'Monthly Recurring Revenue (MRR) Growth',
        description: 'MRR broken down by New, Expansion, and Churn',
        xAxisKey: 'month',
        dataKeys: ['New MRR', 'Expansion MRR', 'Churned MRR'],
        data: [
          { month: 'Jan', 'New MRR': 24000, 'Expansion MRR': 12000, 'Churned MRR': -6000 },
          { month: 'Feb', 'New MRR': 28000, 'Expansion MRR': 15000, 'Churned MRR': -7000 },
          { month: 'Mar', 'New MRR': 22000, 'Expansion MRR': 18000, 'Churned MRR': -18000 },
          { month: 'Apr', 'New MRR': 35000, 'Expansion MRR': 21000, 'Churned MRR': -9000 },
          { month: 'May', 'New MRR': 38000, 'Expansion MRR': 24000, 'Churned MRR': -8000 },
          { month: 'Jun', 'New MRR': 42000, 'Expansion MRR': 29000, 'Churned MRR': -8500 }
        ]
      },
      {
        id: 'c2',
        type: 'bar',
        title: 'Revenue Distribution by Region',
        xAxisKey: 'region',
        dataKeys: ['Revenue ($K)'],
        data: [
          { region: 'North America', 'Revenue ($K)': 680 },
          { region: 'Europe', 'Revenue ($K)': 410 },
          { region: 'Asia Pacific', 'Revenue ($K)': 220 },
          { region: 'Latin America', 'Revenue ($K)': 110 }
        ]
      }
    ],
    insights: [
      {
        id: 'i1',
        observation: 'Enterprise expansion offset 82% of total ARR lost to SMB churn in Q2.',
        interpretation: 'Focusing sales resources on upselling key accounts provides a strong hedge against self-serve churn volatility.',
        confidence: 0.93,
        category: 'Revenue Strategy'
      },
      {
        id: 'i2',
        observation: 'March pricing changes directly correlated with a 128% increase in support tickets citing "feature tier gating".',
        interpretation: 'The current feature placement in the starter tier created unexpected friction for existing users.',
        confidence: 0.89,
        category: 'Product Packaging'
      }
    ],
    recommendations: [
      {
        id: 'r1',
        title: 'Re-evaluate Starter Tier Gating',
        description: 'Restore core reporting features to the Starter plan or offer a 30-day grace period for legacy users.',
        priority: 'high',
        actionableStep: 'Schedule pricing strategy review with Product Marketing before Q3 launch.'
      },
      {
        id: 'r2',
        title: 'Double Down on APAC Enterprise Webinars',
        description: 'APAC region showed the highest lead conversion velocity (+40%) during recent digital workshops.',
        priority: 'medium',
        actionableStep: 'Allocate 15% more demand gen budget to regional APAC virtual events.'
      }
    ],
    metadata: {
      sourceCount: 2,
      generatedAt: new Date().toISOString(),
      schemaVersion: '1.0',
      fileNames: ['q2_saas_metrics.csv', 'dashboard_march_analytics.png']
    }
  }
};
