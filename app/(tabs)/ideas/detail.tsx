import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Share,
    ShareContent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Toast } from 'toastify-react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { ThemeType, useTheme } from '../../../context/ThemeContext';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { SubmittedIdea } from '../../../types/idea';
import { Bot } from 'lucide-react-native';
import Constants from 'expo-constants';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function IdeaDetailScreen() {
    const { theme } = useTheme();
    const { ideaData }: { ideaData: string } = useLocalSearchParams();
    const [currentIdea, setCurrentIdea] = useState(JSON.parse(ideaData) as SubmittedIdea);
    const [hasVoted, setHasVoted] = useState(false);

    const heartScale = useSharedValue(1);
    const shareScale = useSharedValue(1);

    const navigation = useNavigation();
    const router = useRouter();

    useEffect(() => {
        checkVoteStatus();
        navigation.setOptions({ title: currentIdea.name });
    }, [currentIdea]);

    const checkVoteStatus = async () => {
        try {
            const votedIdeas = await AsyncStorage.getItem('votedIdeas');
            if (votedIdeas) {
                const voted = JSON.parse(votedIdeas);
                setHasVoted(voted.includes(currentIdea.id));
            }
        } catch (error) {
            console.error('Error checking vote status:', error);
        }
    };

    const handleVote = async () => {
        if (hasVoted) {
            Toast.warn('You already voted for this idea!', 'top');
            return;
        }

        heartScale.value = withSpring(1.3, {}, () => {
            heartScale.value = withSpring(1);
        });

        try {
            // Update idea votes
            const savedIdeas = await AsyncStorage.getItem('ideas');
            if (savedIdeas) {
                const ideas = JSON.parse(savedIdeas);
                const updatedIdeas = ideas.map((i: SubmittedIdea) =>
                    i.id === currentIdea.id ? { ...i, votes: i.votes + 1 } : i
                );
                await AsyncStorage.setItem('ideas', JSON.stringify(updatedIdeas));

                // Update local state
                setCurrentIdea(prev => ({ ...prev, votes: prev.votes + 1 }));
            }

            // Mark as voted
            const votedIdeas = await AsyncStorage.getItem('votedIdeas');
            const voted = votedIdeas ? JSON.parse(votedIdeas) : [];
            await AsyncStorage.setItem('votedIdeas', JSON.stringify([...voted, currentIdea.id]));
            setHasVoted(true);

            Toast.success('Vote counted! 🎉', 'top');
        } catch (error) {
            console.error('Error voting:', error);
            Toast.error('Error voting', 'top');
        }
    };

    const handleShare = async () => {
        shareScale.value = withSpring(0.95, {}, () => {
            shareScale.value = withSpring(1);
        });

        try {
            console.log('sharing');
            const shareMessage = `🚀 Check out this startup idea: ${currentIdea.name}\n\n"${currentIdea.tagline}"\n\n${currentIdea.description}\n\n🤖 AI Rating: ${currentIdea.aiRating}/100\n❤️ Votes: ${currentIdea.votes}`;
            const result = await Share.share({
                title: 'Startup Evaluator',
                message: shareMessage,
            } as ShareContent);

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                    console.log('shared with activity type of', result.activityType);
                } else {
                    // shared
                    console.log('shared');
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed

            }

            // if (await Sharing.isAvailableAsync()) {
            //     await Sharing.shareAsync(shareContent);
            // } else {
            //     // Fallback to React Native Share
            //     await Share.share({
            //         message: shareContent,
            //     });
            // }
        } catch (error) {
            console.error('Error sharing:', error);
            Toast.error('Error sharing idea', 'top');
        }
    };

    const getRatingColor = (rating: number) => {
        if (rating >= 80) return theme.colors.success;
        if (rating >= 60) return theme.colors.secondary;
        return theme.colors.error;
    };

    const getRatingLabel = (rating: number) => {
        if (rating >= 90) return 'Exceptional';
        if (rating >= 80) return 'Excellent';
        if (rating >= 70) return 'Good';
        if (rating >= 60) return 'Average';
        if (rating >= 50) return 'Below Average';
        return 'Needs Work';
    };

    const animatedHeartStyle = useAnimatedStyle(() => ({
        transform: [{ scale: heartScale.value }],
    }));

    const animatedShareStyle = useAnimatedStyle(() => ({
        transform: [{ scale: shareScale.value }],
    }));

    const styles = createDetailStyles(theme);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LinearGradient
                colors={theme.colors.gradient}
                style={styles.heroSection}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.heroContent}>
                    <Ionicons style={styles.backButton} name="arrow-back" size={24} color={"white"} onPress={() => navigation.goBack()} />

                    <Text style={styles.ideaName}>{currentIdea.name}</Text>
                    <Text style={styles.ideaTagline}>{currentIdea.tagline}</Text>

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <View style={[styles.ratingBadge, { backgroundColor: getRatingColor(currentIdea.aiRating) }]}>
                                <Bot size={20} color="white" />

                                <Text style={styles.ratingNumber}>{currentIdea.aiRating}</Text>
                            </View>
                            <Text style={styles.statLabel}>AI Rating</Text>
                            <Text style={styles.ratingLabel}>{getRatingLabel(currentIdea.aiRating)}</Text>
                        </View>

                        <View style={styles.statItem}>
                            <View style={styles.votesBadge}>
                                <Ionicons name="heart" size={20} color={theme.colors.error} />
                                <Text style={styles.votesNumber}>{currentIdea.votes}</Text>
                            </View>
                            <Text style={styles.statLabel}>
                                {currentIdea.votes === 1 ? 'Vote' : 'Votes'}
                            </Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.contentSection}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="document-text" size={24} color={theme.colors.primary} />
                    <Text style={styles.sectionTitle}>Description</Text>
                </View>
                <Text style={styles.description}>{currentIdea.description}</Text>

                <View style={styles.metaInfo}>
                    <View style={styles.metaItem}>
                        <Ionicons name="calendar" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.metaText}>
                            Created on {new Date(currentIdea.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="time" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.metaText}>
                            {new Date(currentIdea.createdAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.actionSection}>
                <AnimatedTouchableOpacity
                    style={[styles.actionButton, styles.voteButton, animatedHeartStyle]}
                    onPress={handleVote}
                    disabled={hasVoted}
                >
                    <LinearGradient
                        colors={hasVoted ? [theme.colors.error, theme.colors.error] : [theme.colors.error, '#ff6b9d']}
                        style={[styles.buttonGradient, hasVoted && styles.votedGradient]}
                    >
                        <Ionicons
                            name={hasVoted ? "heart" : "heart-outline"}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.actionButtonText}>
                            {hasVoted ? 'Voted' : 'Vote'}
                        </Text>
                    </LinearGradient>
                </AnimatedTouchableOpacity>

                <AnimatedTouchableOpacity
                    style={[styles.actionButton, animatedShareStyle]}
                    onPress={handleShare}
                >
                    <LinearGradient
                        colors={[theme.colors.primary, theme.colors.primaryLight]}
                        style={styles.buttonGradient}
                    >
                        <Ionicons name="share-social" size={24} color="white" />
                        <Text style={styles.actionButtonText}>Share</Text>
                    </LinearGradient>
                </AnimatedTouchableOpacity>
            </View>
        </ScrollView>
    );
}

const createDetailStyles = (theme: ThemeType) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    heroSection: {
        paddingHorizontal: 20,
        paddingTop: 30 + Constants.statusBarHeight,
        paddingBottom: 30,
        minHeight: 200,
    },
    heroContent: {
        alignItems: 'center',
        gap: 16,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        top: 0,
        left: 0,
        padding: 8,
    },
    ideaName: {
        fontSize: 28,
        fontFamily: 'Inter-Bold',
        color: 'white',
        textAlign: 'center',
    },
    ideaTagline: {
        fontSize: 18,
        fontFamily: 'Inter-Regular',
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        lineHeight: 24,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 40,
        marginTop: 20,
    },
    statItem: {
        alignItems: 'center',
        gap: 8,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        gap: 8,
        minWidth: 80,
        justifyContent: 'center',
    },
    ratingNumber: {
        fontSize: 20,
        fontFamily: 'Inter-Bold',
        color: 'white',
    },
    votesBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        gap: 8,
        minWidth: 80,
        justifyContent: 'center',
    },
    votesNumber: {
        fontSize: 20,
        fontFamily: 'Inter-Bold',
        color: 'white',
    },
    statLabel: {
        fontSize: 14,
        fontFamily: 'Inter-Medium',
        color: 'rgba(255, 255, 255, 0.8)',
    },
    ratingLabel: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        color: 'rgba(255, 255, 255, 0.7)',
    },
    contentSection: {
        padding: 20,
        gap: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: 'Inter-Bold',
        color: theme.colors.text,
    },
    description: {
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        color: theme.colors.text,
        lineHeight: 24,
    },
    metaInfo: {
        gap: 12,
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metaText: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: theme.colors.textSecondary,
    },
    actionSection: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 30,
        justifyContent: 'center',
        gap: 16,
    },
    actionButton: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    voteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: 140,
        paddingVertical: 16,
        gap: 8,
    },
    votedGradient: {
        opacity: 0.7,
    },
    actionButtonText: {
        fontSize: 18,
        fontFamily: 'Inter-Bold',
        color: 'white',
    },
});