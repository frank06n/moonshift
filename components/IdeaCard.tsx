import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    GestureResponderEvent,
    Share,
    ShareContent,
} from 'react-native';
import { SubmittedIdea } from "../types/idea";
import { ThemeType, useTheme } from "../context/ThemeContext";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Toast } from 'toastify-react-native';


export default function IdeaCard({ idea, hasVoted, handleVote }: { idea: SubmittedIdea; hasVoted: boolean; handleVote: (ideaId: string) => void }) {
    const { theme } = useTheme();
    const router = useRouter();

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
    
    const getRatingColor = (rating: number) => {
        if (rating >= 80) return theme.colors.success;
        if (rating >= 60) return theme.colors.secondary;
        return theme.colors.error;
    };

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

    const styles = createStyles(theme);

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

const createStyles = (theme: ThemeType) => StyleSheet.create({
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
});