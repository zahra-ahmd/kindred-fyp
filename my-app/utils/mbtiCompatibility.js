// app/utils/mbtiCompatibility.js

export const mbtiCompatibility = {
    INFJ: {
      ENFP: 1.0, INFP: 0.9, ENFJ: 0.85, INTJ: 0.8, INFJ: 0.75,
      ENTP: 0.7, INTP: 0.65, ISFP: 0.6, ISTP: 0.55, ENTJ: 0.5,
      ESFP: 0.45, ESTP: 0.4, ISFJ: 0.35, ISTJ: 0.3, ESFJ: 0.25, ESTJ: 0.2
    },
    ENFP: {
      INFJ: 1.0, INTJ: 0.9, INFP: 0.85, ENTP: 0.8, ENFP: 0.75,
      INTP: 0.7, ENFJ: 0.65, ISFP: 0.6, ISTP: 0.55, ENTJ: 0.5,
      ESFP: 0.45, ESTP: 0.4, ISFJ: 0.35, ISTJ: 0.3, ESFJ: 0.25, ESTJ: 0.2
    },
    INTJ: {
      ENFP: 1.0, ENTP: 0.9, INFJ: 0.85, INFP: 0.8, INTJ: 0.75,
      INTP: 0.7, ENTJ: 0.65, ISFP: 0.6, ISTP: 0.55, ENFJ: 0.5,
      ESFP: 0.45, ESTP: 0.4, ISFJ: 0.35, ISTJ: 0.3, ESFJ: 0.25, ESTJ: 0.2
    },
    INFP: {
      ENFJ: 1.0, INFJ: 0.9, ENFP: 0.85, INTJ: 0.8, INFP: 0.75,
      ENTP: 0.7, INTP: 0.65, ISFP: 0.6, ISTP: 0.55, ENTJ: 0.5,
      ESFP: 0.45, ESTP: 0.4, ISFJ: 0.35, ISTJ: 0.3, ESFJ: 0.25, ESTJ: 0.2
    },
    ENFJ: {
      INFP: 1.0, ISFP: 0.9, ENFP: 0.85, INFJ: 0.8, ENFJ: 0.75,
      INTJ: 0.7, INTP: 0.65, ISTP: 0.6, ENTP: 0.55, ENTJ: 0.5,
      ISFJ: 0.45, ISTJ: 0.4, ESFP: 0.35, ESTP: 0.3, ESFJ: 0.25, ESTJ: 0.2
    },
    ENTP: {
      INFJ: 1.0, INTJ: 0.9, INFP: 0.85, ENFP: 0.8, ENTP: 0.75,
      INTP: 0.7, ISFP: 0.65, ISTP: 0.6, ENTJ: 0.55, ENFJ: 0.5,
      ESFP: 0.45, ESTP: 0.4, ISFJ: 0.35, ISTJ: 0.3, ESFJ: 0.25, ESTJ: 0.2
    },
    ISFP: {
      ENFJ: 1.0, ISFJ: 0.9, INFP: 0.85, ENFP: 0.8, ISFP: 0.75,
      INFJ: 0.7, ISTP: 0.65, ESFP: 0.6, ENTP: 0.55, INTJ: 0.5,
      ESTP: 0.45, ENTJ: 0.4, INTP: 0.35, ISTJ: 0.3, ESFJ: 0.25, ESTJ: 0.2
    },
    ISFJ: {
      ESFP: 1.0, ISFP: 0.9, ENFJ: 0.85, INFP: 0.8, ISFJ: 0.75,
      INFJ: 0.7, ENFP: 0.65, ISTP: 0.6, INTJ: 0.55, INTP: 0.5,
      ENTP: 0.45, ISTJ: 0.4, ENTJ: 0.35, ESTP: 0.3, ESFJ: 0.25, ESTJ: 0.2
    },
    ISTP: {
      ESFP: 1.0, ISTP: 0.9, INTP: 0.85, ESTP: 0.8, ISFP: 0.75,
      ENTP: 0.7, INTJ: 0.65, INFJ: 0.6, ENFP: 0.55, ENFJ: 0.5,
      ISFJ: 0.45, ISTJ: 0.4, ESFJ: 0.35, ESTJ: 0.3, INFP: 0.25, ENTJ: 0.2
    },
    ISTJ: {
      ESFP: 1.0, ISFJ: 0.9, ESTJ: 0.85, ISTJ: 0.8, ISFP: 0.75,
      INFJ: 0.7, INFP: 0.65, ENFJ: 0.6, ENFP: 0.55, ENTJ: 0.5,
      INTJ: 0.45, INTP: 0.4, ENTP: 0.35, ESTP: 0.3, ESFJ: 0.25, ISTP: 0.2
    },
    ESTJ: {
      ISFP: 1.0, ISTP: 0.9, ESTJ: 0.85, ISTJ: 0.8, ESFJ: 0.75,
      ENFJ: 0.7, INFJ: 0.65, INFP: 0.6, ENFP: 0.55, ENTJ: 0.5,
      INTJ: 0.45, INTP: 0.4, ENTP: 0.35, ESTP: 0.3, ISFJ: 0.25, ESFP: 0.2
    },
    ESFJ: {
      ISFP: 1.0, INFP: 0.9, ESFJ: 0.85, ESTJ: 0.8, ISFJ: 0.75,
      ENFJ: 0.7, INFJ: 0.65, ENFP: 0.6, INTP: 0.55, INTJ: 0.5,
      ENTP: 0.45, ISTJ: 0.4, ENTJ: 0.35, ISTP: 0.3, ESTP: 0.25, ESFP: 0.2
    },
    ESFP: {
      ISTJ: 1.0, ISFJ: 0.9, ESFP: 0.85, ESTP: 0.8, ISFP: 0.75,
      ENFP: 0.7, INFP: 0.65, ENFJ: 0.6, INFJ: 0.55, INTJ: 0.5,
      INTP: 0.45, ENTP: 0.4, ISTP: 0.35, ESTJ: 0.3, ESFJ: 0.25, ENTJ: 0.2
    },
    ESTP: {
      ISFJ: 1.0, INFJ: 0.9, ESTP: 0.85, ESFP: 0.8, ISTP: 0.75,
      ENFP: 0.7, INFP: 0.65, ENFJ: 0.6, INTJ: 0.55, INTP: 0.5,
      ENTP: 0.45, ISTJ: 0.4, ENTJ: 0.35, ESTJ: 0.3, ESFJ: 0.25, ISFP: 0.2
    },
    ENTJ: {
      INFP: 1.0, INTP: 0.9, ENTJ: 0.85, INTJ: 0.8, ENTP: 0.75,
      INFJ: 0.7, ENFP: 0.65, ISFP: 0.6, ISTP: 0.55, ENFJ: 0.5,
      ESFP: 0.45, ESTP: 0.4, ISFJ: 0.35, ISTJ: 0.3, ESFJ: 0.25, ESTJ: 0.2
    },
    INTP: {
      ENTJ: 1.0, ENTP: 0.9, INTP: 0.85, INTJ: 0.8, INFJ: 0.75,
      ENFP: 0.7, INFP: 0.65, ISFP: 0.6, ISTP: 0.55, ENFJ: 0.5,
      ESTP: 0.45, ESFP: 0.4, ISFJ: 0.35, ESFJ: 0.3, ISTJ: 0.25, ESTJ: 0.2
    },
  };
  