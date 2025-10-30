import { useState, useEffect } from 'react';
import { supabase, PrakritiResult, DietRecommendation } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Utensils, CheckCircle, XCircle, Lightbulb } from 'lucide-react';

const DIET_DATA = {
  vata: {
    foods_to_favor: [
      'Warm, cooked foods',
      'Sweet fruits (bananas, avocados, mangoes)',
      'Cooked vegetables (sweet potatoes, carrots, beets)',
      'Whole grains (rice, wheat, oats)',
      'Warming spices (ginger, cinnamon, cumin)',
      'Healthy fats (ghee, sesame oil, nuts)',
      'Warm milk and dairy',
    ],
    foods_to_avoid: [
      'Cold, raw foods',
      'Dry, light foods',
      'Bitter vegetables (kale, spinach)',
      'Beans (except mung beans)',
      'Carbonated drinks',
      'Caffeine',
    ],
    meal_suggestions: {
      breakfast: ['Warm oatmeal with cinnamon', 'Scrambled eggs with toast', 'Smoothie with banana and dates'],
      lunch: ['Vegetable soup with rice', 'Chicken curry with quinoa', 'Stir-fried vegetables with noodles'],
      dinner: ['Khichdi with ghee', 'Baked fish with sweet potato', 'Pasta with creamy sauce'],
      snacks: ['Almonds', 'Fresh dates', 'Warm herbal tea'],
    },
    lifestyle_tips: [
      'Eat warm, freshly cooked meals',
      'Maintain regular meal times',
      'Avoid skipping meals',
      'Stay hydrated with warm water',
      'Practice calming activities like yoga',
      'Get adequate rest and sleep',
    ],
  },
  pitta: {
    foods_to_favor: [
      'Cool, refreshing foods',
      'Sweet fruits (melons, grapes, coconuts)',
      'Leafy greens and vegetables',
      'Whole grains (barley, oats, rice)',
      'Cooling herbs (cilantro, mint, fennel)',
      'Moderate amounts of dairy',
      'Sweet and bitter tastes',
    ],
    foods_to_avoid: [
      'Spicy, hot foods',
      'Sour fruits (citrus)',
      'Tomatoes and hot peppers',
      'Red meat',
      'Alcohol',
      'Fried foods',
    ],
    meal_suggestions: {
      breakfast: ['Coconut pancakes', 'Fruit salad with yogurt', 'Smoothie with berries'],
      lunch: ['Quinoa salad with cucumber', 'Grilled chicken with greens', 'Vegetable wrap'],
      dinner: ['Steamed fish with vegetables', 'Rice with lentil curry', 'Pasta primavera'],
      snacks: ['Fresh fruits', 'Cucumber slices', 'Coconut water'],
    },
    lifestyle_tips: [
      'Eat cooling, fresh foods',
      'Avoid excessive heat and sun',
      'Practice moderation in all activities',
      'Engage in cooling exercises like swimming',
      'Take breaks to prevent burnout',
      'Avoid competitive situations',
    ],
  },
  kapha: {
    foods_to_favor: [
      'Light, warm foods',
      'Spicy and pungent foods',
      'Bitter vegetables (kale, spinach)',
      'Lighter grains (quinoa, millet, barley)',
      'Warming spices (ginger, black pepper)',
      'Legumes and beans',
      'Honey in moderation',
    ],
    foods_to_avoid: [
      'Heavy, oily foods',
      'Sweet, salty foods',
      'Dairy products',
      'Wheat and rice',
      'Red meat',
      'Cold drinks',
    ],
    meal_suggestions: {
      breakfast: ['Light vegetable soup', 'Poached eggs with greens', 'Fruit salad with ginger tea'],
      lunch: ['Spicy lentil soup', 'Grilled chicken salad', 'Vegetable stir-fry'],
      dinner: ['Vegetable curry with quinoa', 'Baked fish with steamed vegetables', 'Bean soup'],
      snacks: ['Apple slices', 'Roasted chickpeas', 'Herbal tea'],
    },
    lifestyle_tips: [
      'Eat light, warm, dry foods',
      'Avoid overeating',
      'Stay active with vigorous exercise',
      'Wake up early',
      'Avoid afternoon naps',
      'Seek variety and stimulation',
    ],
  },
};

export function DietChart() {
  const { user } = useAuth();
  const [result, setResult] = useState<PrakritiResult | null>(null);
  const [recommendation, setRecommendation] = useState<DietRecommendation | null>(null);
  const [loading, setLoading] = useState(true);

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

      let { data: recData } = await supabase
        .from('diet_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('dosha_type', resultData.dominant_dosha)
        .maybeSingle();

      if (!recData) {
        const dietData = DIET_DATA[resultData.dominant_dosha as keyof typeof DIET_DATA];
        const { data: newRec } = await supabase
          .from('diet_recommendations')
          .insert([
            {
              user_id: user.id,
              dosha_type: resultData.dominant_dosha,
              foods_to_favor: dietData.foods_to_favor,
              foods_to_avoid: dietData.foods_to_avoid,
              meal_suggestions: dietData.meal_suggestions,
              lifestyle_tips: dietData.lifestyle_tips,
            },
          ])
          .select()
          .single();

        recData = newRec;
      }

      setRecommendation(recData);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading diet recommendations...</div>
      </div>
    );
  }

  if (!result || !recommendation) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Complete the Prakriti quiz to get personalized diet recommendations</p>
      </div>
    );
  }

  const doshaColors = {
    vata: 'bg-blue-100 text-blue-700',
    pitta: 'bg-red-100 text-red-700',
    kapha: 'bg-green-100 text-green-700',
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4">
            <Utensils className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Personalized Diet Chart</h2>
            <p className="text-gray-600">
              Based on your{' '}
              <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${doshaColors[result.dominant_dosha as keyof typeof doshaColors]}`}>
                {result.dominant_dosha.toUpperCase()}
              </span>{' '}
              constitution
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-emerald-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="w-6 h-6 text-emerald-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Foods to Favor</h3>
            </div>
            <ul className="space-y-2">
              {recommendation.foods_to_favor.map((food, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-emerald-600 mr-2">•</span>
                  <span className="text-gray-700">{food}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <XCircle className="w-6 h-6 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Foods to Avoid</h3>
            </div>
            <ul className="space-y-2">
              {recommendation.foods_to_avoid.map((food, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span className="text-gray-700">{food}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Meal Suggestions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(recommendation.meal_suggestions).map(([meal, suggestions]) => (
              <div key={meal} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2 capitalize">{meal}</h4>
                <ul className="space-y-1">
                  {(suggestions as string[]).map((item, index) => (
                    <li key={index} className="text-sm text-gray-700">• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Lightbulb className="w-6 h-6 text-amber-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Lifestyle Tips</h3>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendation.lifestyle_tips.map((tip, index) => (
              <li key={index} className="flex items-start">
                <span className="text-amber-600 mr-2">→</span>
                <span className="text-gray-700">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
