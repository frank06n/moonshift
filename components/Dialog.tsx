import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ThemeType, useTheme } from "../context/ThemeContext";

type DialogProps = {
    visible: boolean;
    title: string;
    message: string;
    onYes: () => void;
    onNo: () => void;
};

export default function Dialog({ visible, title, message, onYes, onNo }: DialogProps) {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    return <Modal transparent visible={visible} animationType="fade">
        <View style={styles.overlay}>
            <LinearGradient
                colors={[theme.colors.card, theme.colors.surface]}
                style={styles.dialogContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.message}>{message}</Text>

                <View style={styles.buttonRow}>
                    <TouchableOpacity style={[styles.button, styles.noButton]} onPress={onNo}>
                        <Ionicons name="close-outline" size={18} color={theme.colors.error} />
                        <Text style={[styles.buttonText, { color: theme.colors.error }]}>No</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, styles.yesButton]} onPress={onYes}>
                        <Ionicons name="checkmark-outline" size={18} color={theme.colors.primary} />
                        <Text style={[styles.buttonText, { color: theme.colors.primary }]}>Yes</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    </Modal>;
};

const createStyles = (theme: ThemeType) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    dialogContainer: {
        width: "80%",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: theme.colors.text,
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 20,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    yesButton: {
        backgroundColor: theme.colors.surface,
    },
    noButton: {
        backgroundColor: theme.colors.surface,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: "500",
    },
});
