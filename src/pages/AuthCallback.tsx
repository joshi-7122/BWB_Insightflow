import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Sparkles, Loader2 } from 'lucide-react';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setError(error.message);
      } else if (session) {
        navigate('/dashboard', { replace: true });
      } else {
        // Wait briefly for hash/query fragment exchange
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            subscription.unsubscribe();
            navigate('/dashboard', { replace: true });
          }
        });
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-4">
      <div className="glass-panel p-8 rounded-2xl max-w-sm w-full text-center space-y-4 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
          <Sparkles className="w-6 h-6 animate-spin text-indigo-400" />
        </div>

        {error ? (
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-rose-400">Authentication Failed</h3>
            <p className="text-xs text-slate-400">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 px-4 py-2 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Completing Sign In</h3>
            <p className="text-xs text-slate-400">Verifying session with Supabase Auth...</p>
            <Loader2 className="w-5 h-5 animate-spin text-indigo-400 mx-auto mt-2" />
          </div>
        )}
      </div>
    </div>
  );
};
