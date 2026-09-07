// Gemini Multimodal AI Provider Integration for Supabase Edge Functions

export class GeminiProvider {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = Deno.env.get('GEMINI_API_KEY') || '';
    // Target gemini-2.5-pro for accurate business data understanding
    this.model = Deno.env.get('GEMINI_MODEL') || 'gemini-2.5-pro';
  }

  async generateReport(fileContents: string[], title: string) {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in Edge Function environment');
    }

    const systemPrompt = `
You are an expert Business Intelligence Analyst.
Analyze the following business dataset / extracted contents and convert it into a strict structured analytical report JSON.

Target Schema:
{
  "title": "Report Title",
  "summary": "Concise executive summary (2-3 sentences)",
  "confidence": 0.94,
  "metrics": [
    { "id": "m1", "name": "Metric Name", "value": 1000, "unit": "USD", "period": "Q2", "change": 0.12, "comparisonPeriod": "vs Q1" }
  ],
  "trends": [
    { "id": "t1", "title": "Trend Title", "description": "Details", "direction": "up", "impact": "positive" }
  ],
  "anomalies": [
    { "id": "a1", "metric": "Metric Name", "description": "Outlier detail", "severity": "high", "detectedPeriod": "March", "magnitude": 2.1, "confidence": 0.9 }
  ],
  "charts": [
    {
      "id": "c1",
      "type": "bar",
      "title": "Chart Title",
      "xAxisKey": "category",
      "dataKeys": ["value"],
      "data": [{ "category": "A", "value": 10 }]
    }
  ],
  "insights": [
    { "id": "i1", "observation": "Fact", "interpretation": "Meaning", "confidence": 0.9, "category": "Revenue" }
  ],
  "recommendations": [
    { "id": "r1", "title": "Action Item", "description": "Details", "priority": "high", "actionableStep": "Step" }
  ],
  "metadata": {
    "sourceCount": 1,
    "generatedAt": "${new Date().toISOString()}",
    "schemaVersion": "1.0"
  }
}

Return ONLY valid JSON matching this schema. Never invent non-existent metrics.
`;

    const userPrompt = `Dataset Title: ${title}\nExtracted Contents:\n${fileContents.join('\n---\n')}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { text: userPrompt }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(rawText);
  }
}
