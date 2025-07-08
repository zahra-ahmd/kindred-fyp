import { View, Text, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import MyButton from '../../components/MyButton'; 
 

export default function Filler() {
  return (
    <View style={styles.container}>

      {/* Logo */}
      <Image 
        source={require('../../assets/images/kindred-logo.png')} 
        style={styles.logo} 
        resizeMode="contain" 
      />

      {/* Heading */}
      <Text style={styles.heading}>Tell Us A Little About Yourself</Text>
      <Text style={styles.subheading}>Fill out a small questionnaire</Text>
      <Text style={styles.description}>
        This will help us form an initial personality overview
      </Text>

      <MyButton
        title="Continue"
        variant="primary" 
        onPress={() => router.push('/questions')}
      />

    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FAFAF1',
    alignItems: 'center',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  backText: {
    fontSize: 24,
    color: '#000',
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  subheading: {
    fontSize: 16,
    color: '#666',
    marginVertical: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
}
