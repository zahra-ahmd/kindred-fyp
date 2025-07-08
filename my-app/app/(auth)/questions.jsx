import { useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet, Image} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const questions = [
  {
    title: 'Introversion & Extraversion',
    question: 'How do you typically recharge after a long, stressful day?',
    options: [
      { text: 'I prefer being around others—chatting, going out, or engaging in group activities.', value: 'E' },
      { text: 'I prefer quiet time alone to reflect, read, or do something solo.', value: 'I' },
    ],
  },
  {
    title: 'Sensing vs Intuition',
    question: 'When learning something new, what approach do you naturally take?',
    options: [
      { text: 'I focus on concrete facts, details, and practical applications.', value: 'S' },
      { text: 'I look for patterns, big-picture ideas, and future possibilities.', value: 'N' },
    ],
  },
  {
    title: 'Thinking vs Feeling',
    question: 'When making decisions, what do you rely on more?',
    options: [
      { text: 'Objective logic and analysis—what makes the most sense logically.', value: 'T' },
      { text: 'Personal values and how the outcome affects others emotionally.', value: 'F' },
    ],
  },
  {
    title: 'Judging vs Perceiving',
    question: 'Which of the following best describes how you prefer to live your life?',
    options: [
      { text: 'I like things planned, structured, and decided.', value: 'J' },
      { text: 'I prefer to stay flexible, open to new options and spontaneity.', value: 'P' },
    ],
  },
];

const images = [
  require('../../assets/images/intro_extra.png'),
  require('../../assets/images/sens_int.png'),
  require('../../assets/images/thin_feel.png'),
  require('../../assets/images/judj_per.png'),
];


export default function Questions() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);

  const handleNext = () => {
    if (selectedOption !== null) {
      const selectedValue = questions[currentQuestion].options[selectedOption].value;
  
      const updatedAnswers = [...answers];
      updatedAnswers[currentQuestion] = selectedValue;
      setAnswers(updatedAnswers);
  
      if (currentQuestion < questions.length - 1) {
        setSelectedOption(null);
        setCurrentQuestion(currentQuestion + 1);
      } else {
        const mbtiResult = updatedAnswers.join('');
        console.log('Your MBTI Type:', mbtiResult);
        router.push({ pathname: '/results', params: { result: mbtiResult } });
      }
    }
  };
  

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>{questions[currentQuestion].title}</Text>

      {/* Placeholder for Image */}
      <Image
        source={images[currentQuestion]}
        style={styles.imagePlaceholder}
        resizeMode="cover"
      />

      {/* Question */}
      <Text style={styles.question}>
        {questions[currentQuestion].question}
      </Text>

      {/* Options */}
      {questions[currentQuestion].options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.optionButton,
            selectedOption === index && styles.selectedOption,
          ]}
          onPress={() => setSelectedOption(index)}
        >
          <Text style={styles.optionText}>{option.text}</Text>
        </TouchableOpacity>
      ))}

      {/* Next Button */}
      <TouchableOpacity
        style={styles.nextContainer}
        onPress={handleNext}
        disabled={selectedOption === null}
      >
        <Text style={styles.nextText}>Next</Text>
        <Ionicons
          name="arrow-forward"
          size={24}
          color={selectedOption !== null ? 'black' : '#ccc'}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBEF',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 40,
    marginBottom: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#D9D9D9',
    borderRadius: 12,
    marginBottom: 24,
  },
  question: {
    fontSize: 18,
    color: '#000',
    fontWeight: '600',
    marginHorizontal: 5,
    marginBottom: 10,
  },
  optionButton: {
    backgroundColor: '#F8F8F8',
    height: 100, 
    width: '100%', 
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  
  selectedOption: {
    borderColor: '#1B2C18',
    backgroundColor: '#EEF5EE',
  },

  optionText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    flexWrap: 'wrap', // Allows wrapping inside fixed box
  },
  
  nextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  nextText: {
    fontSize: 18,
    color: '#000',
    marginRight: 8,
  },
});

