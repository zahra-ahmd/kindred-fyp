import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { predictUserMBTI } from '@/helpers/personalityHistory';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

const TRAIT_COLORS = {
  I: '#4A90E2', // Blue
  E: '#D94F4F', // Red
  S: '#F5A623', // Orange
  N: '#50E3C2', // Teal
  T: '#9013FE', // Purple
  F: '#B8E986', // Light green
  J: '#F8E71C', // Yellow
  P: '#7ED321', // Green
};

const BAR_WIDTH = 40;
const BAR_MAX_HEIGHT = 180; // max bar height for 100%

const TRAIT_FULL_NAMES = {
  I: 'Introversion',
  E: 'Extraversion',
  S: 'Sensing',
  N: 'Intuition',
  T: 'Thinking',
  F: 'Feeling',
  J: 'Judging',
  P: 'Perceiving',
};

function LatestMBTIVerticalBarChart({ percentages }) {
  if (!percentages) return null;

  const traits = Object.entries(percentages)
    .filter(([, pct]) => pct > 0)
    .map(([trait]) => trait);

  if (traits.length === 0) return null;

  const chartWidth = traits.length * (BAR_WIDTH + 20);

  return (
    <View style={{ marginTop: 20, height: BAR_MAX_HEIGHT + 70 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <Svg height={BAR_MAX_HEIGHT + 80} width={chartWidth}>
          {traits.map((trait, i) => {
            const pct = percentages[trait];
            const barHeight = (pct / 100) * BAR_MAX_HEIGHT;

            return (
              <React.Fragment key={trait}>
                <Rect
                  x={i * (BAR_WIDTH + 20) + 10}
                  y={BAR_MAX_HEIGHT - barHeight + 20}
                  width={BAR_WIDTH}
                  height={barHeight}
                  fill={TRAIT_COLORS[trait] || '#888'}
                  rx={6}
                  ry={6}
                />
                <SvgText
                  x={i * (BAR_WIDTH + 20) + 10 + BAR_WIDTH / 2}
                  y={BAR_MAX_HEIGHT - barHeight + 10}
                  fill="#333"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {Math.floor(pct)}%
                </SvgText>
                <SvgText
                  x={i * (BAR_WIDTH + 20) + 10 + BAR_WIDTH / 2 - 5}
                  y={BAR_MAX_HEIGHT + 60}
                  fill="#555"
                  fontSize="14"
                  fontWeight="600"
                  textAnchor="start"
                  transform={`rotate(-90, ${i * (BAR_WIDTH + 20) + 10 + BAR_WIDTH / 2 - 5}, ${BAR_MAX_HEIGHT + 60})`}
                >
                  {trait}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </ScrollView>
    </View>
  );
}

function Legend({ traits }) {
  return (
    <View style={styles.legendContainer}>
      {traits.map((trait) => (
        <View key={trait} style={styles.legendItem}>
          <View
            style={[styles.colorBox, { backgroundColor: TRAIT_COLORS[trait] || '#888' }]}
          />
          <Text style={styles.legendLabel}>{TRAIT_FULL_NAMES[trait] || trait}</Text>
        </View>
      ))}
    </View>
  );
}

export default function PersonalityInsightsSection() {
  const { user } = useAuth();
  const [latestEntry, setLatestEntry] = useState(null);
  const [previousEntry, setPreviousEntry] = useState(null);

  useEffect(() => {
    if (user) {
      (async () => {
        await predictUserMBTI(user);
        fetchLatestEntries();
      })();
    }
  }, [user]);

  const fetchLatestEntries = async () => {
    const { data, error } = await supabase
      .from('personality_history')
      .select('type, trait_scores, trait_percentages, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(2); // Fetch last 2 entries

    if (error) {
      console.error('Fetch entries error:', error);
    } else if (data && data.length > 0) {
      setLatestEntry(data[0]);
      setPreviousEntry(data.length > 1 ? data[1] : null);
    }
  };

  const generateChangeText = () => {
    if (!latestEntry || !previousEntry) return null;

    const changes = [];
    const latest = latestEntry.trait_percentages;
    const previous = previousEntry.trait_percentages;

    // Calculate differences per trait
    Object.keys(latest).forEach(trait => {
      const diff = latest[trait] - (previous[trait] || 0);
      if (Math.abs(diff) >= 5) { // threshold: only show changes >= 5%
        changes.push({ trait, diff });
      }
    });

    if (changes.length === 0) {
      return (
        <Text style={styles.changeText}>
          • No significant changes since last time.
        </Text>
      );
    }

    return (
      <View style={styles.bulletContainer}>
        {changes.map((change, index) => (
          <Text key={index} style={styles.changeText}>
            • You showed {Math.abs(Math.floor(change.diff))}% {change.diff > 0 ? 'more' : 'less'} {TRAIT_FULL_NAMES[change.trait]} recently.
          </Text>
        ))}
      </View>
    );
  };


  if (!latestEntry) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Your Personality Insights</Text>
        <Text style={styles.noHistory}>No entries yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.type}>Your Latest Personality Insight</Text>

        <LatestMBTIVerticalBarChart percentages={latestEntry.trait_percentages} />

        <Legend traits={Object.keys(latestEntry.trait_percentages).filter(trait => latestEntry.trait_percentages[trait] > 0)} />

        {/* Add change summary text here */}
        <Text style={styles.changeText}>{generateChangeText()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noHistory: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  type: {
    fontSize: 18,
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
  },
  changeText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 15,
    color: '#555',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 20,
    //marginHorizontal: 10,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderRadius: 10,
    paddingVertical: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  colorBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 14,
    color: '#444',
    fontWeight: '600',
  },
  bulletContainer: {
  marginTop: 10,
  paddingLeft: 10,
  gap: 6,
},
changeText: {
  fontSize: 15,
  fontWeight: '600',
  color: '#555',
},

});
