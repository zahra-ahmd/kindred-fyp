import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function CustomButton({
  title,
  onPress,
  variant = 'primary', // default variant
  disabled = false,
  width = '60%',
}) {
  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        { width },
        variantStyles[variant].button,
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Text style={[
        styles.baseText,
        variantStyles[variant].text,
        disabled && styles.textDisabled
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

  const styles = StyleSheet.create({
    baseButton: {
      borderRadius: 7,
      paddingVertical: 10,
      paddingHorizontal: 10,
      justifyContent: 'center',
      alignItems: 'center',
      width: '60%',
      borderWidth: 1,
    },
    baseText: {
      fontSize: 16,
      fontWeight: '600',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    textDisabled: {
      color: '#000',
    },
  });
  
  const variantStyles = {
    primary: {
      button: {
        backgroundColor: '#102515',
        borderColor: '#102515',
      },
      buttonPressed: {
        backgroundColor: 'transparent',
      },
      text: {
        color: '#FCFFF5',
      },
      textPressed: {
        color: '#102515',
      },
    },
    outline: {
      button: {
        backgroundColor: 'transparent',
        borderColor: '#102515',
      },
      buttonPressed: {
        backgroundColor: '#102515',
      },
      text: {
        color: '#102515',
      },
      textPressed: {
        color: '#FFFFFF',
      },
    },
  };
  