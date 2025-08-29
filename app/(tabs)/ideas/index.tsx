import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Toast } from 'toastify-react-native';
import { ThemeType, useTheme } from '../../../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { SubmittedIdea } from '../../../types/idea';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import IdeaCard from '../../../components/IdeaCard';
import Dialog from '../../../components/Dialog';

export default function IdeaListingScreen() {
    const { theme } = useTheme();
    const [ideas, setIdeas] = useState<SubmittedIdea[]>([]);
    const [sortBy, setSortBy] = useState<'votes' | 'rating'>('rating');
    const [refreshing, setRefreshing] = useState(false);
    const [votedIdeas, setVotedIdeas] = useState(new Set());
    const [showDialog, setShowDialog] = useState(false);
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
            else {
                setIdeas([]);
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
            else {
                setVotedIdeas(new Set());
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
                    <View style={{ flex: 1, alignSelf: 'stretch', flexDirection: 'row-reverse', alignItems: 'stretch' }}>
                        <TouchableOpacity style={{
                            aspectRatio: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 100,
                            backgroundColor: theme.colors.error as string + '20',
                        }}
                            onPress={() => setShowDialog(true)}>
                            <Ionicons name="trash" size={16} color={theme.colors.error} />
                        </TouchableOpacity>
                    </View>
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
                    renderItem={({ item, index }) => <IdeaCard idea={item} hasVoted={votedIdeas.has(item.id)} handleVote={handleVote} />}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                    }
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <Dialog
                visible={showDialog}
                title="Confirm Delete"
                message="Are you sure you want to delete all startup ideas?"
                onYes={async () => {
                    await AsyncStorage.clear();
                    await loadIdeas();
                    await loadVotedIdeas();
                    setShowDialog(false);
                }}
                onNo={() => setShowDialog(false)}
            />
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

