import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, Users, Activity, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  completedQuizzes: number;
  pendingFollowUps: number;
  recentActivity: number;
}

interface UserData {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  has_quiz: boolean;
  dosha?: string;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    completedQuizzes: 0,
    pendingFollowUps: 0,
    recentActivity: 0,
  });
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'followups'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, created_at');

    const { data: results } = await supabase.from('prakriti_results').select('user_id, dominant_dosha');

    const { data: followUps } = await supabase
      .from('follow_ups')
      .select('status')
      .eq('status', 'pending');

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('id')
      .gte('created_at', lastWeek.toISOString());

    const { data: authUsers } = await supabase.auth.admin.listUsers();

    const usersWithQuiz: UserData[] = (profiles || []).map((profile) => {
      const userResult = results?.find((r) => r.user_id === profile.id);
      const authUser = authUsers?.users.find((u) => u.id === profile.id);
      return {
        id: profile.id,
        full_name: profile.full_name,
        email: authUser?.email || '',
        created_at: profile.created_at,
        has_quiz: !!userResult,
        dosha: userResult?.dominant_dosha,
      };
    });

    setStats({
      totalUsers: profiles?.length || 0,
      completedQuizzes: results?.length || 0,
      pendingFollowUps: followUps?.length || 0,
      recentActivity: recentUsers?.length || 0,
    });

    setUsers(usersWithQuiz);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
            <Shield className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
            <p className="text-gray-600">Manage users and monitor wellness progress</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-900">{stats.totalUsers}</span>
            </div>
            <div className="text-sm font-medium text-blue-700">Total Users</div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 text-emerald-600" />
              <span className="text-2xl font-bold text-emerald-900">{stats.completedQuizzes}</span>
            </div>
            <div className="text-sm font-medium text-emerald-700">Completed Quizzes</div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <CalendarIcon className="w-8 h-8 text-amber-600" />
              <span className="text-2xl font-bold text-amber-900">{stats.pendingFollowUps}</span>
            </div>
            <div className="text-sm font-medium text-amber-700">Pending Follow-ups</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-purple-900">{stats.recentActivity}</span>
            </div>
            <div className="text-sm font-medium text-purple-700">New This Week</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'border-b-2 border-emerald-600 text-emerald-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'users'
                  ? 'border-b-2 border-emerald-600 text-emerald-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('followups')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'followups'
                  ? 'border-b-2 border-emerald-600 text-emerald-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Follow-ups
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Dosha Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['vata', 'pitta', 'kapha'].map((dosha) => {
                  const count = users.filter((u) => u.dosha === dosha).length;
                  const percentage = stats.completedQuizzes > 0 ? (count / stats.completedQuizzes) * 100 : 0;
                  return (
                    <div key={dosha} className="bg-white rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-2 capitalize">{dosha}</div>
                      <div className="text-2xl font-bold text-gray-800 mb-2">{count}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            dosha === 'vata'
                              ? 'bg-blue-600'
                              : dosha === 'pitta'
                              ? 'bg-red-600'
                              : 'bg-green-600'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{percentage.toFixed(1)}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Quiz Completion Rate</span>
                  <span className="font-semibold text-gray-800">
                    {stats.totalUsers > 0 ? ((stats.completedQuizzes / stats.totalUsers) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Active Users (This Week)</span>
                  <span className="font-semibold text-gray-800">{stats.recentActivity}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dosha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.has_quiz ? (
                        <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                      {user.dosha || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'followups' && (
          <div className="text-center py-8 text-gray-600">
            Follow-up management view - Track and manage user follow-ups
          </div>
        )}
      </div>
    </div>
  );
}
