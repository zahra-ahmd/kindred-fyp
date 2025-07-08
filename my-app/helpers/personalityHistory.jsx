import { supabase } from '@/lib/supabase';
import { interest_mapping } from './mapping';

// Calculate MBTI trait scores
function scoreInterests(interests, mbtiMap) {
  const scores = { I: 0, E: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  const interestSet = new Set(interests.map(i => i.toLowerCase()));

  for (const [trait, keywords] of Object.entries(mbtiMap)) {
    const matchCount = keywords.filter(k => interestSet.has(k.toLowerCase())).length;
    scores[trait] += matchCount;
  }

  return scores;
}

// Calculate percentages for each MBTI trait pair
function calculatePercentages(scores) {
  const pairs = [
    ['I', 'E'],
    ['S', 'N'],
    ['T', 'F'],
    ['J', 'P'],
  ];

  const percentages = {};

  for (const [t1, t2] of pairs) {
    const total = scores[t1] + scores[t2];
    if (total === 0) {
      percentages[t1] = 50;
      percentages[t2] = 50;
    } else {
      percentages[t1] = (scores[t1] / total) * 100;
      percentages[t2] = (scores[t2] / total) * 100;
    }
  }

  return percentages;
}

function calculateSoftmaxPercentages(scores) {
  const pairs = [['I','E'], ['S','N'], ['T','F'], ['J','P']];
  const percentages = {};

  for (const [t1, t2] of pairs) {
    const exp1 = Math.exp(scores[t1]);
    const exp2 = Math.exp(scores[t2]);
    const total = exp1 + exp2;

    if (total === 0) {
      percentages[t1] = 50;
      percentages[t2] = 50;
    } else {
      percentages[t1] = (exp1 / total) * 100;
      percentages[t2] = (exp2 / total) * 100;
    }
  }
  return percentages;
}


// Main function to predict and save MBTI type
export async function predictUserMBTI(user) {
  if (!user) return;

  // Fetch selected_interests from profile
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('selected_interests')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Profile fetch error:', profileError);
    return null;
  }

  // Fetch post tags
  const { data: postsData, error: postsError } = await supabase
    .from('posts')
    .select('tags')
    .eq('user_id', user.id);

  if (postsError) {
    console.error('Posts fetch error:', postsError);
    return null;
  }

  const selectedInterests = profileData.selected_interests || [];
  const postTags = postsData.flatMap(post => post.tags || []);
  const combined = [...selectedInterests, ...postTags];

  // Get trait scores
  const scores = scoreInterests(combined, interest_mapping);

  // Derive MBTI type
  const type = [
    scores.I >= scores.E ? 'I' : 'E',
    scores.S >= scores.N ? 'S' : 'N',
    scores.T >= scores.F ? 'T' : 'F',
    scores.J >= scores.P ? 'J' : 'P'
  ].join('');

  // Calculate percentages
  const percentages = calculateSoftmaxPercentages(scores);

  // Check last entry to avoid duplicates
  const { data: latest, error: latestError } = await supabase
    .from('personality_history')
    .select('type')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (!latestError && latest?.type === type) {
    return { type, scores, percentages }; // skip inserting duplicate type
  }

  // Insert new personality history record
  const { error: insertError } = await supabase
    .from('personality_history')
    .insert([{
      user_id: user.id,
      type,
      trait_scores: scores, // raw counts
      trait_percentages: percentages, // new percentages field
      updated_at: new Date().toISOString()
    }]);

  if (insertError) {
    console.error('Insert error:', insertError);
  }

  return { type, scores, percentages };
}
