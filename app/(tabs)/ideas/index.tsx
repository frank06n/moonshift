import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    GestureResponderEvent,
    Share,
    ShareContent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Toast } from 'toastify-react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import { ThemeType, useTheme } from '../../../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { SubmittedIdea } from '../../../types/idea';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function IdeaListingScreen() {
    const { theme } = useTheme();
    const [ideas, setIdeas] = useState<SubmittedIdea[]>([]);
    const [sortBy, setSortBy] = useState('rating'); // 'rating' or 'votes'
    const [refreshing, setRefreshing] = useState(false);
    const [votedIdeas, setVotedIdeas] = useState(new Set());
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            loadIdeas();
            loadVotedIdeas();
        }, [])
    );

    const loadIdeas = async () => {
        try {
            const savedIdeas = await AsyncStorage.getItem('ideas');
            if (savedIdeas) {
                const parsedIdeas = JSON.parse(savedIdeas);
                setIdeas(parsedIdeas);
            }
        } catch (error) {
            console.error('Error loading ideas:', error);
        }
    };

    const loadVotedIdeas = async () => {
        try {
            const voted = await AsyncStorage.getItem('votedIdeas');
            if (voted) {
                setVotedIdeas(new Set(JSON.parse(voted)));
            }
        } catch (error) {
            console.error('Error loading voted ideas:', error);
        }
    };

    const handleVote = async (ideaId: string) => {
        if (votedIdeas.has(ideaId)) {
            Toast.warn('You already voted for this idea!', 'top');
            return;
        }

        try {
            const updatedIdeas = ideas.map(idea =>
                idea.id === ideaId ? { ...idea, votes: idea.votes + 1 } : idea
            );

            await AsyncStorage.setItem('ideas', JSON.stringify(updatedIdeas));

            const newVotedIdeas = new Set([...votedIdeas, ideaId]);
            await AsyncStorage.setItem('votedIdeas', JSON.stringify([...newVotedIdeas]));

            setIdeas(updatedIdeas);
            setVotedIdeas(newVotedIdeas);

            Toast.success('Vote counted!', 'top');
        } catch (error) {
            console.error('Error voting:', error);
            Toast.error('Error voting', 'top');
        }
    };

    const shareIdea = async (idea: SubmittedIdea) => {
        try {
            const shareMessage = `🚀 Check out this startup idea: ${idea.name}\n\n"${idea.tagline}"\n\n${idea.description}\n\n🤖 AI Rating: ${idea.aiRating}/100\n❤️ Votes: ${idea.votes}`;
            await Share.share({
                title: 'Startup Evaluator',
                message: shareMessage,
            } as ShareContent);
        } catch (error) {
            console.error('Error sharing:', error);
            Toast.error('Error sharing idea', 'top');
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadIdeas();
        await loadVotedIdeas();
        setRefreshing(false);
    }, []);

    const sortedIdeas = [...ideas].sort((a, b) => {
        if (sortBy === 'rating') {
            return b.aiRating - a.aiRating;
        } else {
            return b.votes - a.votes;
        }
    });

    const getRatingColor = (rating: number) => {
        if (rating >= 80) return theme.colors.success;
        if (rating >= 60) return theme.colors.secondary;
        return theme.colors.error;
    };

    const IdeaCard = ({ idea, index }: { idea: SubmittedIdea; index: number }) => {
        const cardScale = useSharedValue(1);
        const hasVoted = votedIdeas.has(idea.id);

        const animatedCardStyle = useAnimatedStyle(() => ({
            transform: [{ scale: cardScale.value }],
        }));

        const handleCardPress = () => {
            router.push({
                pathname: '/ideas/detail',
                params: { ideaData: JSON.stringify(idea) },
            });
        };

        const handleVotePress = (e: GestureResponderEvent) => {
            e.stopPropagation();
            handleVote(idea.id);
        };

        const renderRightActions = () => (
            <TouchableOpacity
                style={styles.shareAction}
                onPress={() => shareIdea(idea)}
            >
                <Ionicons name="share" size={24} color="white" />
                <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
        );

        return <TouchableOpacity
            style={styles.ideaCard}
            onPress={handleCardPress}
        >
            <LinearGradient
                colors={[theme.colors.card, theme.colors.surface]}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.ideaInfo}>
                        <Text style={styles.ideaName} numberOfLines={1}>
                            {idea.name}
                        </Text>
                        <Text style={styles.ideaTagline} numberOfLines={2}>
                            {idea.tagline}
                        </Text>
                    </View>
                    <View style={[styles.ratingBadge, { backgroundColor: getRatingColor(idea.aiRating) }]}>
                        <Text style={styles.ratingText}>{idea.aiRating}</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.cardFooterButtonsContainer}>
                        <TouchableOpacity
                            style={[
                                styles.voteButton,
                                hasVoted && styles.votedButton
                            ]}
                            onPress={handleVotePress}
                            disabled={hasVoted}
                        >
                            <Ionicons
                                name={hasVoted ? "heart" : "heart-outline"}
                                size={16}
                                color={hasVoted ? theme.colors.error : theme.colors.primary}
                            />
                            <Text style={[
                                styles.voteText,
                                hasVoted && styles.votedText
                            ]}>
                                {idea.votes} {idea.votes === 1 ? 'vote' : 'votes'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.shareButton}
                            onPress={() => shareIdea(idea)}
                        >
                            <Ionicons
                                name={"share-social-outline"}
                                size={16}
                                color={theme.colors.primary}
                            />
                            <Text style={styles.shareText}>
                                Share
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.dateText}>
                        {new Date(idea.createdAt).toLocaleDateString()}
                    </Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>;
    };

    const styles = createStyles(theme);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.sortContainer}>
                    <Text style={styles.sortLabel}>Sort by:</Text>
                    <TouchableOpacity
                        style={[styles.sortButton, sortBy === 'rating' && styles.activeSortButton]}
                        onPress={() => setSortBy('rating')}
                    >
                        <Ionicons name="star" size={16} color={sortBy === 'rating' ? 'white' : theme.colors.primary} />
                        <Text style={[styles.sortButtonText, sortBy === 'rating' && styles.activeSortButtonText]}>
                            AI Rating
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.sortButton, sortBy === 'votes' && styles.activeSortButton]}
                        onPress={() => setSortBy('votes')}
                    >
                        <Ionicons name="heart" size={16} color={sortBy === 'votes' ? 'white' : theme.colors.primary} />
                        <Text style={[styles.sortButtonText, sortBy === 'votes' && styles.activeSortButtonText]}>
                            Votes
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {ideas.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="bulb-outline" size={64} color={theme.colors.textSecondary} />
                    <Text style={styles.emptyTitle}>No Ideas Yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Be the first to submit a startup idea!
                    </Text>
                    <TouchableOpacity
                        style={styles.submitFirstButton}
                        onPress={() => router.push('/submit')}
                    >
                        <Text style={styles.submitFirstButtonText}>Submit First Idea</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={sortedIdeas}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => <IdeaCard idea={item} index={index} />}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                    }
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const createStyles = (theme: ThemeType) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    sortContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    sortLabel: {
        fontSize: 14,
        fontFamily: 'Inter-Medium',
        color: theme.colors.text,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: 4,
    },
    activeSortButton: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    sortButtonText: {
        fontSize: 12,
        fontFamily: 'Inter-Medium',
        color: theme.colors.text,
    },
    activeSortButtonText: {
        color: 'white',
    },
    listContainer: {
        padding: 20,
        gap: 16,
    },
    swipeableContainer: {
    },
    ideaCard: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardGradient: {
        padding: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
        gap: 12,
    },
    ideaInfo: {
        flex: 1,
    },
    ideaName: {
        fontSize: 18,
        fontFamily: 'Inter-Bold',
        color: theme.colors.text,
        marginBottom: 4,
    },
    ideaTagline: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: theme.colors.textSecondary,
        lineHeight: 20,
    },
    ratingBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        minWidth: 40,
        alignItems: 'center',
    },
    ratingText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Inter-Bold',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardFooterButtonsContainer: {
        flexDirection: 'row',
        gap: 16
    },
    voteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    votedButton: {
        backgroundColor: theme.colors.error as string + '20',
        borderColor: theme.colors.error as string + '20',
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    shareText: {
        fontSize: 12,
        fontFamily: 'Inter-Medium',
        color: theme.colors.primary,
    },
    voteText: {
        fontSize: 12,
        fontFamily: 'Inter-Medium',
        color: theme.colors.primary,
    },
    votedText: {
        color: theme.colors.error,
    },
    dateText: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        color: theme.colors.textSecondary,
    },
    shareAction: {
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        borderTopRightRadius: 16,
        borderBottomRightRadius: 16,
    },
    actionText: {
        color: 'white',
        fontSize: 12,
        fontFamily: 'Inter-Medium',
        marginTop: 4,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 24,
        fontFamily: 'Inter-Bold',
        color: theme.colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    submitFirstButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    submitFirstButtonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Inter-Bold',
    },
});

