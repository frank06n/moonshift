import { Tabs } from "expo-router";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import ToastManager from "toastify-react-native";
import { CirclePlus as PlusCircle, Trophy, Lightbulb, View } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { ActivityIndicator, SafeAreaView, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";



function InnerStack() {
    const { theme, isDark } = useTheme();
    console.log(theme, isDark);

    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        loadFonts();
    }, []);

    const loadFonts = async () => {
        try {
            await Font.loadAsync({
                'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
                'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
                'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
            });
            setFontsLoaded(true);
        } catch (error) {
            console.log('Error loading fonts:', error);
            setFontsLoaded(true); // Continue without custom fonts
        }
    };

    if (!fontsLoaded) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator
                size="large"
                color={theme.colors.primary as string}
            />
            <Text>Loading fonts...</Text>
        </View>;
    }

    return <>
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.colors.primary as string,
                tabBarInactiveTintColor: theme.colors.textSecondary as string,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.border,
                    paddingBottom: 5,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontFamily: "Inter-Medium",
                    fontSize: 12,
                },
                headerStyle: {
                    backgroundColor: theme.colors.background,
                    // shadowColor: "transparent",
                    // elevation: 0,
                },
                headerTintColor: theme.colors.text as string,
                headerTitleStyle: {
                    fontFamily: "Inter-Bold",
                    fontSize: 18,
                },
            }}
        >
            <Tabs.Screen
                name="submit"
                options={{
                    title: 'Submit Idea',
                    headerShown: false,
                    tabBarIcon: ({ size, color }) => (
                        <PlusCircle size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="ideas"
                options={{
                    title: 'All Ideas',
                    headerShown: false,
                    tabBarIcon: ({ size, color }) => (
                        <Lightbulb size={size} color={color} /> // or List
                    ),
                }}
            />
            <Tabs.Screen
                name="leaderboard"
                options={{
                    title: 'Leaderboard',
                    headerShown: false,
                    tabBarIcon: ({ size, color }) => (
                        <Trophy size={size} color={color} />
                    ),
                }}
            />
        </Tabs>

        <ToastManager />
        <StatusBar style={isDark ? "light" : "dark"} />
    </>;
}

export default function RootLayout() {


    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <ThemeProvider>
                    <InnerStack />
                </ThemeProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView >
    );
}
