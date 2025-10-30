import { useState, useEffect } from 'react';
import { supabase, PrakritiQuestion } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Brain, ChevronRight, ChevronLeft } from 'lucide-react';

interface QuizResults {
  vata: number;
  pitta: number;
  kapha: number;
  answers: Record<string, string>;
}

export function PrakritiQuiz({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<PrakritiQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    const { data, error } = await supabase
      .from('prakriti_questions')
      .select('*')
      .order('order_number');

    if (data) {
      setQuestions(data);
    }
    setLoading(false);
  };

  const handleAnswer = (questionId: string, dosha: string) => {
    setAnswers({ ...answers, [questionId]: dosha });
  };

  const calculateResults = (): QuizResults => {
    let vata = 0, pitta = 0, kapha = 0;

    Object.values(answers).forEach((dosha) => {
      if (dosha === 'vata') vata++;
      else if (dosha === 'pitta') pitta++;
      else if (dosha === 'kapha') kapha++;
    });

    return { vata, pitta, kapha, answers };
  };

  const handleSubmit = async () => {
    if (!user) return;

    setSubmitting(true);
    const results = calculateResults();

    const doshas = [
      { name: 'vata', score: results.vata },
      { name: 'pitta', score: results.pitta },
      { name: 'kapha', score: results.kapha },
    ].sort((a, b) => b.score - a.score);

    const { error } = await supabase.from('prakriti_results').insert([
      {
        user_id: user.id,
        vata_score: results.vata,
        pitta_score: results.pitta,
        kapha_score: results.kapha,
        dominant_dosha: doshas[0].name,
        secondary_dosha: doshas[1].score > 0 ? doshas[1].name : null,
        quiz_answers: results.answers,
      },
    ]);

    setSubmitting(false);

    if (!error) {
      onComplete();
    }
  };

  const goNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading quiz...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-600">No questions available</p>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
            <Brain className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">Prakriti Analysis Quiz</h2>
            <p className="text-gray-600">Discover your unique Ayurvedic constitution</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mb-8">
          <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full mb-4">
            {question.category.charAt(0).toUpperCase() + question.category.slice(1)}
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-6">{question.question}</h3>

          <div className="space-y-3">
            <button
              onClick={() => handleAnswer(question.id, 'vata')}
              className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                answers[question.id] === 'vata'
                  ? 'border-emerald-600 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-300 bg-white'
              }`}
            >
              <div className="flex items-start">
                <div className={`w-5 h-5 rounded-full border-2 mr-3 mt-0.5 flex-shrink-0 ${
                  answers[question.id] === 'vata'
                    ? 'border-emerald-600 bg-emerald-600'
                    : 'border-gray-300'
                }`}>
                  {answers[question.id] === 'vata' && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
                <span className="text-gray-700">{question.vata_option}</span>
              </div>
            </button>

            <button
              onClick={() => handleAnswer(question.id, 'pitta')}
              className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                answers[question.id] === 'pitta'
                  ? 'border-emerald-600 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-300 bg-white'
              }`}
            >
              <div className="flex items-start">
                <div className={`w-5 h-5 rounded-full border-2 mr-3 mt-0.5 flex-shrink-0 ${
                  answers[question.id] === 'pitta'
                    ? 'border-emerald-600 bg-emerald-600'
                    : 'border-gray-300'
                }`}>
                  {answers[question.id] === 'pitta' && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
                <span className="text-gray-700">{question.pitta_option}</span>
              </div>
            </button>

            <button
              onClick={() => handleAnswer(question.id, 'kapha')}
              className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                answers[question.id] === 'kapha'
                  ? 'border-emerald-600 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-300 bg-white'
              }`}
            >
              <div className="flex items-start">
                <div className={`w-5 h-5 rounded-full border-2 mr-3 mt-0.5 flex-shrink-0 ${
                  answers[question.id] === 'kapha'
                    ? 'border-emerald-600 bg-emerald-600'
                    : 'border-gray-300'
                }`}>
                  {answers[question.id] === 'kapha' && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
                <span className="text-gray-700">{question.kapha_option}</span>
              </div>
            </button>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={goBack}
            disabled={currentQuestion === 0}
            className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={goNext}
              disabled={!answers[question.id]}
              className="flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Complete Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
