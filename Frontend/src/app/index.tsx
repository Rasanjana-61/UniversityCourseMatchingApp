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
import { CareerDetailsScreen } from '@/screens/CareerDetailsScreen';
import { JobOpportunitiesScreen } from '@/screens/JobOpportunitiesScreen';
import { SalaryInfoScreen } from '@/screens/SalaryInfoScreen';
import { CompareCoursesScreen } from '@/screens/CompareCoursesScreen';
import { CourseComparisonScreen } from '@/screens/CourseComparisonScreen';
import { ScholarshipsScreen } from '@/screens/ScholarshipsScreen';
import { ScholarshipDetailsScreen } from '@/screens/ScholarshipDetailsScreen';
import { AdmissionRequirementsScreen } from '@/screens/AdmissionRequirementsScreen';
import { AdminLoginScreen } from '@/screens/AdminLoginScreen';
import { AdminDashboardScreen } from '@/screens/AdminDashboardScreen';
import { StudentInquiriesScreen } from '@/screens/StudentInquiriesScreen';
import { NotificationsScreen } from '@/screens/NotificationsScreen';

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
      case 'career-details':
        return <CareerDetailsScreen />;
      case 'job-opportunities':
        return <JobOpportunitiesScreen />;
      case 'salary-info':
        return <SalaryInfoScreen />;
      case 'compare-courses':
        return <CompareCoursesScreen />;
      case 'course-comparison':
        return <CourseComparisonScreen />;
      case 'scholarships':
        return <ScholarshipsScreen />;
      case 'scholarship-details':
        return <ScholarshipDetailsScreen />;
      case 'admission-requirements':
        return <AdmissionRequirementsScreen />;
      case 'student-inquiries':
      case 'inquiries':
        return <StudentInquiriesScreen />;
      case 'notifications':
        return <NotificationsScreen />;
      case 'admin-login':
      case 'admin-register':
      case 'teacher-login':
      case 'teacher-register':
        return <AdminLoginScreen />;
      case 'admin-dashboard':
      case 'admin-questions':
      case 'teacher-dashboard':
      case 'teacher-students':
        return <AdminDashboardScreen />;
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
