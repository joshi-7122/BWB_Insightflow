import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GeminiProvider } from '../_shared/gemini.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { fileNames, extractedContents, title } = body;

    const gemini = new GeminiProvider();
    const reportData = await gemini.generateReport(extractedContents || [], title || 'Data Analysis');

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const reportObj = {
      user_id: 'authenticated-user',
      title: title || reportData.title,
      status: 'completed',
      summary: reportData.summary,
      report_json: reportData,
      schema_version: '1.0',
    };

    const { data: insertedReport, error: dbError } = await supabase
      .from('reports')
      .insert(reportObj)
      .select()
      .single();

    if (dbError) {
      console.error('DB Insert Error:', dbError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        report: insertedReport || { ...reportObj, id: `report-${Date.now()}` },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
