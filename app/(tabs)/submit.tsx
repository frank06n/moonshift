import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ColorValue,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Toast } from 'toastify-react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { ThemeType, useTheme } from '../../context/ThemeContext';
import { useRouter } from 'expo-router';
import { Idea, SubmittedIdea } from '../../types/idea';
import { SafeAreaView } from 'react-native-safe-area-context';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function IdeaSubmissionScreen() {
    const { theme, isDark, toggleTheme } = useTheme();
    const [formData, setFormData] = useState<Idea>({
        name: '',
        tagline: '',
        description: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const buttonScale = useSharedValue(1);
    const formOpacity = useSharedValue(1);

    const router = useRouter();

    const generateAIRating = () => {
        // Generate a fake AI rating between 0-100
        return Math.floor(Math.random() * 101);
    };

    const saveIdea = async () => {
        if (!formData.name.trim() || !formData.tagline.trim() || !formData.description.trim()) {
            Toast.error('Please fill in all fields', 'top');
            return;
        }

        setIsSubmitting(true);
        formOpacity.value = withTiming(0.7);

        try {
            const existingIdeas = await AsyncStorage.getItem('ideas');
            const ideas = existingIdeas ? JSON.parse(existingIdeas) : [];

            const newIdea: SubmittedIdea = {
                id: Date.now().toString(),
                name: formData.name.trim(),
                tagline: formData.tagline.trim(),
                description: formData.description.trim(),
                aiRating: generateAIRating(),
                votes: 0,
                createdAt: new Date().toISOString(),
            };

            const updatedIdeas = [...ideas, newIdea];
            await AsyncStorage.setItem('ideas', JSON.stringify(updatedIdeas));

            Toast.success(`Idea submitted! AI Rating: ${newIdea.aiRating}/100`, 'top');

            // Reset form
            setFormData({ name: '', tagline: '', description: '' });

            // Navigate to Ideas tab after a delay
            setTimeout(() => {
                router.push('ideas');
            }, 1500);

        } catch (error) {
            console.error('Error saving idea:', error);
            Toast.error('Error submitting idea', 'top');
        } finally {
            setIsSubmitting(false);
            formOpacity.value = withTiming(1);
        }
    };

    const handleSubmit = () => {
        buttonScale.value = withSpring(0.95, {}, () => {
            buttonScale.value = withSpring(1);
            runOnJS(saveIdea)();
        });
    };

    const animatedButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: buttonScale.value }],
    }));

    const animatedFormStyle = useAnimatedStyle(() => ({
        opacity: formOpacity.value,
    }));

    const styles = createStyles(theme);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>Submit Your Startup Idea</Text>
                            <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
                                <Ionicons
                                    name={isDark ? 'sunny' : 'moon'}
                                    size={24}
                                    color={theme.colors.text}
                                />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.subtitle}>
                            Share your innovative idea and get AI-powered feedback!
                        </Text>
                    </View>

                    <Animated.View style={[styles.form, animatedFormStyle]}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                <Ionicons name="rocket" size={16} color={theme.colors.primary} /> Startup Name
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                                placeholder="Enter your startup name"
                                placeholderTextColor={theme.colors.textSecondary}
                                maxLength={50}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                <Ionicons name="flash" size={16} color={theme.colors.primary} /> Tagline
                            </Text>
                            <TextInput
                                style={styles.input}
                                value={formData.tagline}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, tagline: text }))}
                                placeholder="A catchy one-liner describing your startup"
                                placeholderTextColor={theme.colors.textSecondary}
                                maxLength={100}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>
                                <Ionicons name="document-text" size={16} color={theme.colors.primary} /> Description
                            </Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={formData.description}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                                placeholder="Describe your startup idea, target market, and what makes it unique..."
                                placeholderTextColor={theme.colors.textSecondary}
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
                                maxLength={500}
                            />
                            <Text style={styles.charCount}>
                                {formData.description.length}/500 characters
                            </Text>
                        </View>

                        <AnimatedTouchableOpacity
                            style={[animatedButtonStyle]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            <LinearGradient
                                colors={theme.colors.gradient as [ColorValue, ColorValue]}
                                style={styles.submitButton}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                {isSubmitting ? (
                                    <Text style={styles.submitButtonText}>Analyzing...</Text>
                                ) : (
                                    <>
                                        <Ionicons name="send" size={20} color="white" />
                                        <Text style={styles.submitButtonText}>Submit Idea</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </AnimatedTouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createStyles = (theme: ThemeType) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollView: {
        flex: 1,
        padding: 20,
    },
    header: {
        marginBottom: 30,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontFamily: 'Inter-Bold',
        color: theme.colors.text,
        flex: 1,
    },
    themeToggle: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        fontFamily: 'Inter-Regular',
        lineHeight: 22,
    },
    form: {
        gap: 24,
    },
    inputContainer: {
        gap: 8,
    },
    label: {
        fontSize: 16,
        fontFamily: 'Inter-Medium',
        color: theme.colors.text,
        marginBottom: 4,
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: theme.colors.text,
        fontFamily: 'Inter-Regular',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    textArea: {
        height: 120,
        paddingTop: 16,
    },
    charCount: {
        textAlign: 'right',
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontFamily: 'Inter-Regular',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginTop: 10,
        gap: 8,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'Inter-Bold',
    },
});

