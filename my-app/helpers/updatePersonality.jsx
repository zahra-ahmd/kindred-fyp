import { supabase } from '@/lib/supabase';

async function getUpdatedMBTI(userId) {
  // 1. Fetch current MBTI from profiles (joining mbti_types)
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('mbti_type_id, mbti_types (type)')
    .eq('id', userId)
    .single();

  if (profileError || !profileData) {
    console.error('Error fetching current MBTI:', profileError);
    return null;
  }

  const currentMBTI = profileData.mbti_types.type;

  // 2. Fetch MBTI history from personality_history
  const { data: historyData, error: historyError } = await supabase
    .from('personality_history')
    .select('type')
    .eq('user_id', userId);

  if (historyError) {
    console.error('Error fetching MBTI history:', historyError);
    return null;
  }

  const historyMBTIs = historyData.map(entry => entry.type);

  // 3. Compute the updated MBTI
  const updatedMBTI = calculateUpdatedMBTI(currentMBTI, historyMBTIs);

   await saveMBTIToUser(userId, updatedMBTI);

}

function calculateUpdatedMBTI(currentMBTI, historyMBTIs) {
  const allMBTIs = [currentMBTI, ...historyMBTIs];

  const letterOptions = [
    ['I', 'E'], ['S', 'N'], ['T', 'F'], ['J', 'P']
  ];

  let result = '';

  for (let i = 0; i < 4; i++) {
    const counts = { [letterOptions[i][0]]: 0, [letterOptions[i][1]]: 0 };

    for (const mbti of allMBTIs) {
      const letter = mbti[i];
      if (counts.hasOwnProperty(letter)) {
        counts[letter]++;
      }
    }

    const [first, second] = letterOptions[i];
    result += counts[first] >= counts[second] ? first : second;
  }

  return result;
}

async function saveMBTIToUser(userId, updatedMBTI) {
  try {
    const { data: mbtiData, error: mbtiError } = await supabase
      .from('mbti_types')
      .select('mbti_id')
      .eq('type', updatedMBTI)
      .single();

    if (mbtiError || !mbtiData) {
      console.error('Error finding MBTI:', mbtiError || 'MBTI type not found');
      return;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ mbti_type_id: mbtiData.mbti_id })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating profile:', updateError);
    } else {
      console.log('updatePersonality: MBTI saved successfully!');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

export default getUpdatedMBTI;
