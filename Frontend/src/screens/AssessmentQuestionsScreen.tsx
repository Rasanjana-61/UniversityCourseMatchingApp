import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { BottomNavBar } from "../components/BottomNavBar";
import { api } from "../services/api";

const DEFAULT_QUESTIONS = [
  { id: 1, text: "I enjoy solving problems using technology.", category: "Technology" },
  { id: 2, text: "I like taking leadership roles and organizing people.", category: "Business" },
  { id: 3, text: "I enjoy expressing my ideas through art, writing, or design.", category: "Creative" },
  { id: 4, text: "I feel fulfilled when I help others learn or solve personal problems.", category: "Social" },
  { id: 5, text: "I find coding or learning how computer systems work fascinating.", category: "Technology" },
  { id: 6, text: "I am interested in how businesses make money and grow.", category: "Business" },
  { id: 7, text: "I often come up with original and out-of-the-box ideas.", category: "Creative" },
  { id: 8, text: "I enjoy working in teams and collaborating with others.", category: "Social" },
  { id: 9, text: "I like analyzing data and numbers to find trends.", category: "Technology" },
  { id: 10, text: "I would like a career where I negotiate and pitch ideas.", category: "Business" },
];

const OPTIONS = [
  { label: "Strongly Agree", value: 3 },
  { label: "Agree", value: 2 },
  { label: "Not Sure", value: 1 },
  { label: "Disagree", value: 0 },
];

export const AssessmentQuestionsScreen: React.FC = () => {
  const { setCurrentScreen, setAssessmentScores } = useApp();
  const [questions, setQuestions] = useState<any[]>(DEFAULT_QUESTIONS);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await api.getQuestions();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setQuestions(res.data);
        }
      } catch (e) {
        console.log("Error loading assessment questions:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleOptionPress = (value: number) => {
    const newAnswers = { ...answers, [currentIndex]: value };
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 150);
    } else {
      // Calculate scores
      const scores = { Technology: 0, Business: 0, Creative: 0, Social: 0 };
      const maxPossible = { Technology: 0, Business: 0, Creative: 0, Social: 0 };

      questions.forEach((q, index) => {
        const cat = (q.category || "Technology") as keyof typeof scores;
        const val = newAnswers[index] || 0;
        if (scores[cat] !== undefined) {
          scores[cat] += val;
          maxPossible[cat] += 3;
        }
      });

      // Calculate percentages
      const percentages = {
        Technology: maxPossible.Technology > 0 ? Math.round((scores.Technology / maxPossible.Technology) * 100) : 50,
        Business: maxPossible.Business > 0 ? Math.round((scores.Business / maxPossible.Business) * 100) : 50,
        Creative: maxPossible.Creative > 0 ? Math.round((scores.Creative / maxPossible.Creative) * 100) : 50,
        Social: maxPossible.Social > 0 ? Math.round((scores.Social / maxPossible.Social) * 100) : 50,
      };

      setAssessmentScores(percentages);
      setCurrentScreen("assessment-profile");
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentScreen("assessment-intro");
    }
  };

  const currentQuestion = questions[currentIndex] || DEFAULT_QUESTIONS[0];
  const progressPercent = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Top Blue Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Question {currentIndex + 1} of {questions.length}</Text>
          <View style={styles.progressWrap}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progressPercent)}% complete</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Question Card */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.text}</Text>
          <Text style={styles.instructionText}>Choose the option that best describes you.</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {OPTIONS.map((opt) => {
            const isSelected = answers[currentIndex] === opt.value;
            return (
              <TouchableOpacity
                key={opt.label}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected
                ]}
                onPress={() => handleOptionPress(opt.value)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  header: {
    backgroundColor: Brand.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    marginRight: 16,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  progressWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 3,
    marginRight: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
  },
  progressText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  questionCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 32,
    alignItems: "center",
  },
  questionText: {
    fontSize: 18,
    fontWeight: "700",
    color: Brand.text,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 26,
  },
  instructionText: {
    fontSize: 13,
    color: Brand.textSecondary,
    textAlign: "center",
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  optionButtonSelected: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: Brand.primary,
  },
  optionTextSelected: {
    color: "#FFFFFF",
  },
});
