import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useApp } from '@/context/AppContext';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { RegisterScreen } from '@/screens/RegisterScreen';
import { ForgotPasswordScreen } from '@/screens/ForgotPasswordScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { StreamSelectScreen } from '@/screens/StreamSelectScreen';
import { ResultsEntryScreen } from '@/screens/ResultsEntryScreen';
import { MatchingResultsScreen } from '@/screens/MatchingResultsScreen';
import { ExploreScreen } from '@/screens/ExploreScreen';
import { SavedCoursesScreen } from '@/screens/SavedCoursesScreen';
import { CourseDetailsScreen } from '@/screens/CourseDetailsScreen';
import { UniversityDetailsScreen } from '@/screens/UniversityDetailsScreen';
import { AssessmentIntroScreen } from '@/screens/AssessmentIntroScreen';
import { AssessmentQuestionsScreen } from '@/screens/AssessmentQuestionsScreen';
import { AssessmentProfileScreen } from '@/screens/AssessmentProfileScreen';
import { AssessmentRecommendationsScreen } from '@/screens/AssessmentRecommendationsScreen';

export default function AppEntry() {
  const { currentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'login':
        return <LoginScreen />;
      case 'register':
        return <RegisterScreen />;
      case 'forgot-password':
        return <ForgotPasswordScreen />;
      case 'home':
        return <HomeScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'stream-select':
        return <StreamSelectScreen />;
      case 'results-entry':
        return <ResultsEntryScreen />;
      case 'matching-results':
        return <MatchingResultsScreen />;
      case 'explore':
        return <ExploreScreen />;
      case 'saved':
        return <SavedCoursesScreen />;
      case 'course-details':
        return <CourseDetailsScreen />;
      case 'university-details':
        return <UniversityDetailsScreen />;
      case 'assessment-intro':
        return <AssessmentIntroScreen />;
      case 'assessment-questions':
        return <AssessmentQuestionsScreen />;
      case 'assessment-profile':
        return <AssessmentProfileScreen />;
      case 'assessment-recommendations':
        return <AssessmentRecommendationsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return <View style={styles.container}>{renderScreen()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
