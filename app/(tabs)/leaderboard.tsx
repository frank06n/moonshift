import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    Dimensions,
    ColorValue,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withDelay,
    runOnJS,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { ThemeType, useTheme } from '../../context/ThemeContext';
import { useRouter } from 'expo-router';
import { SubmittedIdea } from '../../types/idea';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);

export default function LeaderboardScreen() {
    const { theme, isDark, toggleTheme } = useTheme();
    const [ideas, setIdeas] = useState<SubmittedIdea[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [sortBy, setSortBy] = useState('votes'); // 'votes' or 'rating'
    const router = useRouter();

    useFocusEffect(
        useCallback(() => {
            loadIdeas();
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

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadIdeas();
        setRefreshing(false);
    }, []);

    const getTopIdeas = () => {
        const sorted = [...ideas].sort((a, b) => {
            if (sortBy === 'votes') {
                return b.votes - a.votes;
            } else {
                return b.aiRating - a.aiRating;
            }
        });
        return sorted.slice(0, 5);
    };

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return '🥇';
            case 1: return '🥈';
            case 2: return '🥉';
            default: return `${index + 1}`;
        }
    };

    const getRankColor = (index: number): [ColorValue, ColorValue] => {
        switch (index) {
            case 0: return ['#FFD700', '#FFA500'];
            case 1: return ['#C0C0C0', '#A8A8A8'];
            case 2: return ['#CD7F32', '#B8860B'];
            default: return theme.colors.gradient;
        }
    };

    const LeaderboardItem = ({ idea, index }: { idea: SubmittedIdea; index: number }) => {
        const itemOpacity = useSharedValue(0);
        const itemTranslateY = useSharedValue(50);

        React.useEffect(() => {
            itemOpacity.value = withDelay(index * 100, withSpring(1));
            itemTranslateY.value = withDelay(index * 100, withSpring(0));
        }, [index]);

        const animatedStyle = useAnimatedStyle(() => ({
            opacity: itemOpacity.value,
            transform: [{ translateY: itemTranslateY.value }],
        }));

        const handlePress = () => {
            router.push({
                pathname: '/ideas/detail',
                params: { ideaData: JSON.stringify(idea) },
            });
        };

        return (
            <AnimatedView style={[styles.leaderboardItem, animatedStyle]}>
                <TouchableOpacity onPress={handlePress} style={styles.itemTouchable}>
                    <LinearGradient
                        colors={getRankColor(index)}
                        style={styles.itemGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.rankContainer}>
                            <Text style={styles.rankEmoji}>
                                {typeof getRankIcon(index) === 'string' && getRankIcon(index).includes('🎖')
                                    ? getRankIcon(index)
                                    : getRankIcon(index)}
                            </Text>
                            {index >= 3 && (
                                <View style={styles.rankNumber}>
                                    <Text style={styles.rankNumberText}>{index + 1}</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.ideaDetails}>
                            <Text style={styles.leaderboardIdeaName} numberOfLines={1}>
                                {idea.name}
                            </Text>
                            <Text style={styles.leaderboardTagline} numberOfLines={2}>
                                {idea.tagline}
                            </Text>

                            <View style={styles.statsRow}>
                                <View style={styles.statBadge}>
                                    <Ionicons name="heart" size={14} color="rgba(255,255,255,0.9)" />
                                    <Text style={styles.statText}>{idea.votes}</Text>
                                </View>
                                <View style={styles.statBadge}>
                                    <Ionicons name="star" size={14} color="rgba(255,255,255,0.9)" />
                                    <Text style={styles.statText}>{idea.aiRating}</Text>
                                </View>
                            </View>
                        </View>

                        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
                    </LinearGradient>
                </TouchableOpacity>
            </AnimatedView>
        );
    };

    const topIdeas = getTopIdeas();
    const styles = createLeaderboardStyles(theme);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>🏆 Leaderboard</Text>
                        <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
                            <Ionicons
                                name={isDark ? 'sunny' : 'moon'}
                                size={24}
                                color={theme.colors.text}
                            />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.subtitle}>Top performing startup ideas</Text>
                </View>

                <View style={styles.sortContainer}>
                    <Text style={styles.sortLabel}>Rank by:</Text>
                    <TouchableOpacity
                        style={[styles.sortButton, sortBy === 'votes' && styles.activeSortButton]}
                        onPress={() => setSortBy('votes')}
                    >
                        <Ionicons name="heart" size={16} color={sortBy === 'votes' ? 'white' : theme.colors.primary} />
                        <Text style={[styles.sortButtonText, sortBy === 'votes' && styles.activeSortButtonText]}>
                            Votes
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.sortButton, sortBy === 'rating' && styles.activeSortButton]}
                        onPress={() => setSortBy('rating')}
                    >
                        <Ionicons name="star" size={16} color={sortBy === 'rating' ? 'white' : theme.colors.primary} />
                        <Text style={[styles.sortButtonText, sortBy === 'rating' && styles.activeSortButtonText]}>
                            AI Rating
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {topIdeas.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="trophy-outline" size={64} color={theme.colors.textSecondary} />
                    <Text style={styles.emptyTitle}>No Ideas to Rank</Text>
                    <Text style={styles.emptySubtitle}>
                        Submit some ideas and start voting to see the leaderboard!
                    </Text>
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={() => router.push('submit')}
                    >
                        <LinearGradient colors={theme.colors.gradient as [ColorValue, ColorValue]} style={styles.submitButtonGradient}>
                            <Text style={styles.submitButtonText}>Submit Idea</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={topIdeas}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <LeaderboardItem idea={item} index={index} />
                    )}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const createLeaderboardStyles = (theme: ThemeType) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        gap: 16,
    },
    headerTop: {
        gap: 8,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontFamily: 'Inter-Bold',
        color: theme.colors.text,
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
    leaderboardItem: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    itemTouchable: {
        flex: 1,
    },
    itemGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 16,
    },
    rankContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 40,
    },
    rankEmoji: {
        fontSize: 32,
    },
    rankNumber: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginTop: 4,
    },
    rankNumberText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Inter-Bold',
    },
    ideaDetails: {
        flex: 1,
        gap: 8,
    },
    leaderboardIdeaName: {
        fontSize: 18,
        fontFamily: 'Inter-Bold',
        color: 'white',
    },
    leaderboardTagline: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 20,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    statText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
        fontFamily: 'Inter-Medium',
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
    submitButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    submitButtonGradient: {
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Inter-Bold',
    },
});
