import { useState, useEffect } from 'react';
import { supabase, PrakritiResult, DailySchedule as DailyScheduleType } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Clock, Save, Sun, Moon } from 'lucide-react';

const SCHEDULE_TEMPLATES = {
  vata: {
    wake_time: '06:00',
    morning_routine: [
      'Drink warm water with ginger',
      'Self-massage with sesame oil',
      'Gentle yoga or stretching',
      'Meditation (20 minutes)',
      'Warm breakfast',
    ],
    meal_times: {
      breakfast: '07:30 - 08:00',
      lunch: '12:00 - 13:00',
      dinner: '18:00 - 19:00',
    },
    exercise_schedule: [
      'Morning: Gentle yoga or walking (30 min)',
      'Evening: Light stretching (15 min)',
    ],
    meditation_times: ['Morning: 06:30 - 06:50', 'Evening: 19:30 - 19:50'],
    sleep_time: '22:00',
  },
  pitta: {
    wake_time: '06:00',
    morning_routine: [
      'Drink cool water',
      'Self-massage with coconut oil',
      'Moderate yoga practice',
      'Meditation (15 minutes)',
      'Light breakfast',
    ],
    meal_times: {
      breakfast: '07:00 - 08:00',
      lunch: '12:30 - 13:30',
      dinner: '18:30 - 19:30',
    },
    exercise_schedule: [
      'Morning: Moderate exercise - swimming, cycling (45 min)',
      'Evening: Cooling walk (20 min)',
    ],
    meditation_times: ['Morning: 06:30 - 06:45', 'Evening: 20:00 - 20:15'],
    sleep_time: '22:30',
  },
  kapha: {
    wake_time: '05:30',
    morning_routine: [
      'Drink warm water with honey and lemon',
      'Vigorous dry brushing',
      'Energetic yoga or exercise',
      'Meditation (10 minutes)',
      'Light breakfast (optional)',
    ],
    meal_times: {
      breakfast: '07:00 - 08:00 (optional)',
      lunch: '11:30 - 12:30',
      dinner: '17:30 - 18:30',
    },
    exercise_schedule: [
      'Morning: Vigorous exercise - running, aerobics (60 min)',
      'Evening: Active walk or sports (30 min)',
    ],
    meditation_times: ['Morning: 06:00 - 06:10', 'Evening: 19:00 - 19:10'],
    sleep_time: '22:00',
  },
};

export function DailySchedule() {
  const { user } = useAuth();
  const [result, setResult] = useState<PrakritiResult | null>(null);
  const [schedule, setSchedule] = useState<Partial<DailyScheduleType>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    const { data: resultData } = await supabase
      .from('prakriti_results')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (resultData) {
      setResult(resultData);

      let { data: scheduleData } = await supabase
        .from('daily_schedules')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!scheduleData) {
        const template = SCHEDULE_TEMPLATES[resultData.dominant_dosha as keyof typeof SCHEDULE_TEMPLATES];
        const { data: newSchedule } = await supabase
          .from('daily_schedules')
          .insert([
            {
              user_id: user.id,
              ...template,
            },
          ])
          .select()
          .single();

        scheduleData = newSchedule;
      }

      setSchedule(scheduleData || {});
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!user || !schedule.id) return;

    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('daily_schedules')
      .update({
        wake_time: schedule.wake_time,
        morning_routine: schedule.morning_routine,
        meal_times: schedule.meal_times,
        exercise_schedule: schedule.exercise_schedule,
        meditation_times: schedule.meditation_times,
        sleep_time: schedule.sleep_time,
        updated_at: new Date().toISOString(),
      })
      .eq('id', schedule.id);

    setSaving(false);

    if (error) {
      setMessage('Error saving schedule');
    } else {
      setMessage('Schedule saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading daily schedule...</div>
      </div>
    );
  }

  if (!result || !schedule) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Complete the Prakriti quiz to get your personalized daily schedule</p>
      </div>
    );
  }

  const doshaColors = {
    vata: 'bg-blue-100 text-blue-700',
    pitta: 'bg-red-100 text-red-700',
    kapha: 'bg-green-100 text-green-700',
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
            <Clock className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Daily Wellness Schedule</h2>
            <p className="text-gray-600">
              Customized for your{' '}
              <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${doshaColors[result.dominant_dosha as keyof typeof doshaColors]}`}>
                {result.dominant_dosha.toUpperCase()}
              </span>{' '}
              constitution
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Sun className="w-6 h-6 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Morning Routine</h3>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Wake Time</label>
              <input
                type="time"
                value={schedule.wake_time || ''}
                onChange={(e) => setSchedule({ ...schedule, wake_time: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Activities</label>
              <ul className="space-y-2">
                {(schedule.morning_routine || []).map((activity, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-orange-600 mr-2 mt-1">•</span>
                    <span className="text-gray-700">{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Meal Times</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(schedule.meal_times || {}).map(([meal, time]) => (
                <div key={meal}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {meal}
                  </label>
                  <div className="text-gray-700 font-medium">{time}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Exercise Schedule</h3>
            <ul className="space-y-2">
              {(schedule.exercise_schedule || []).map((exercise, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 mr-2 mt-1">→</span>
                  <span className="text-gray-700">{exercise}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-purple-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Meditation Times</h3>
            <ul className="space-y-2">
              {(schedule.meditation_times || []).map((time, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-purple-600 mr-2 mt-1">🧘</span>
                  <span className="text-gray-700">{time}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Moon className="w-6 h-6 text-indigo-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Evening Routine</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sleep Time</label>
              <input
                type="time"
                value={schedule.sleep_time || ''}
                onChange={(e) => setSchedule({ ...schedule, sleep_time: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {message && (
          <div className={`mt-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
            {message}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 w-full md:w-auto flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5 mr-2" />
          {saving ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>
    </div>
  );
}
