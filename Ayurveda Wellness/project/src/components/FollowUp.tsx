import { useState, useEffect } from 'react';
import { supabase, FollowUp as FollowUpType } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, CheckCircle, Clock, MessageSquare } from 'lucide-react';

export function FollowUp() {
  const { user } = useAuth();
  const [followUps, setFollowUps] = useState<FollowUpType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUpType | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadFollowUps();
    }
  }, [user]);

  const loadFollowUps = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('follow_ups')
      .select('*')
      .eq('user_id', user.id)
      .order('follow_up_date', { ascending: false });

    if (data) {
      setFollowUps(data);
    }
    setLoading(false);
  };

  const createFollowUp = async () => {
    if (!user) return;

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const { error } = await supabase.from('follow_ups').insert([
      {
        user_id: user.id,
        follow_up_date: nextWeek.toISOString().split('T')[0],
        status: 'pending',
      },
    ]);

    if (!error) {
      loadFollowUps();
    }
  };

  const submitFeedback = async () => {
    if (!selectedFollowUp || !feedback.trim()) return;

    setSubmitting(true);

    const { error } = await supabase
      .from('follow_ups')
      .update({
        feedback: feedback,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', selectedFollowUp.id);

    setSubmitting(false);

    if (!error) {
      setSelectedFollowUp(null);
      setFeedback('');
      loadFollowUps();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading follow-ups...</div>
      </div>
    );
  }

  const pendingFollowUps = followUps.filter((f) => f.status === 'pending');
  const completedFollowUps = followUps.filter((f) => f.status === 'completed');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
              <Calendar className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Follow-ups & Progress</h2>
              <p className="text-gray-600">Track your wellness journey</p>
            </div>
          </div>
          <button
            onClick={createFollowUp}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
          >
            Schedule Follow-up
          </button>
        </div>

        {followUps.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No follow-ups scheduled yet</p>
            <button
              onClick={createFollowUp}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              Schedule Your First Follow-up
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingFollowUps.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-amber-600" />
                  Pending Follow-ups
                </h3>
                <div className="space-y-3">
                  {pendingFollowUps.map((followUp) => (
                    <div
                      key={followUp.id}
                      className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-gray-800">
                          {new Date(followUp.follow_up_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {new Date(followUp.follow_up_date) < new Date()
                            ? 'Overdue'
                            : `In ${Math.ceil((new Date(followUp.follow_up_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFollowUp(followUp);
                          setFeedback(followUp.feedback || '');
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Complete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completedFollowUps.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-emerald-600" />
                  Completed Follow-ups
                </h3>
                <div className="space-y-3">
                  {completedFollowUps.map((followUp) => (
                    <div
                      key={followUp.id}
                      className="bg-emerald-50 border border-emerald-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-gray-800">
                          {new Date(followUp.follow_up_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                        <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                          Completed
                        </span>
                      </div>
                      {followUp.feedback && (
                        <div className="text-sm text-gray-700 mt-2">
                          <MessageSquare className="w-4 h-4 inline mr-1" />
                          {followUp.feedback}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedFollowUp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Complete Follow-up</h3>
            <p className="text-gray-600 mb-4">
              How has your wellness journey been since{' '}
              {new Date(selectedFollowUp.follow_up_date).toLocaleDateString()}?
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
              placeholder="Share your progress, challenges, and observations..."
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setSelectedFollowUp(null);
                  setFeedback('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                disabled={submitting || !feedback.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
