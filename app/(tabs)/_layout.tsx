import { ThemeProvider, useTheme } from "../../context/ThemeContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import ToastManager from "toastify-react-native";
import React, { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Ionicons from '@expo/vector-icons/Ionicons';

import { withLayoutContext } from "expo-router";
import {
    createMaterialTopTabNavigator,
} from "@react-navigation/material-top-tabs";

const { Navigator } = createMaterialTopTabNavigator();

// Create a Tabs wrapper using Material Top Tabs
export const Tabs = withLayoutContext(Navigator);

function InnerStack() {
    const { theme, isDark } = useTheme();

    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        loadFonts();
    }, []);

    const loadFonts = async () => {
        try {
            await Font.loadAsync({
                'Inter-Regular': require('../../assets/fonts/Inter-Regular.ttf'),
                'Inter-Medium': require('../../assets/fonts/Inter-Medium.ttf'),
                'Inter-Bold': require('../../assets/fonts/Inter-Bold.ttf'),
            });
            setFontsLoaded(true);
        } catch (error) {
            console.log('Error loading fonts:', error);
            setFontsLoaded(true); // Continue without custom fonts
        }
    };

    if (!fontsLoaded) {
        return <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator
                size="large"
                color={theme.colors.primary as string}
            />
            <Text>Loading fonts...</Text>
        </View>;
    }


    return <GestureHandlerRootView style={{ flex: 1 }}>
        <Tabs
            tabBarPosition="bottom" // move tabs to bottom
            screenOptions={{
                swipeEnabled: true,   // 👈 swipe between tabs
                tabBarActiveTintColor: theme.colors.primary as string,
                tabBarInactiveTintColor: theme.colors.textSecondary as string,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopColor: theme.colors.border,
                    paddingBottom: 5,
                    height: 65,
                },
                tabBarLabelStyle: {
                    fontFamily: "Inter-Medium",
                    fontSize: 12,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Submit Idea',
                    tabBarIcon: ({ color }: { color: string; }) => <Ionicons name="add-circle-outline" size={24} color={color}  />
                }}
            />

            <Tabs.Screen
                name="ideas"
                options={{
                    title: 'All Ideas',
                    tabBarIcon: ({ color }: { color: string; }) => <Ionicons name="bulb-outline" size={24} color={color}  />
                }}
            />
            <Tabs.Screen
                name="leaderboard"
                options={{
                    title: 'Leaderboard',
                    tabBarIcon: ({ color }: { color: string; }) => <Ionicons name="trophy-outline" size={24} color={color}  />
                }}
            />
        </Tabs>

        <ToastManager />
        <StatusBar style={isDark ? "light" : "dark"} />
    </GestureHandlerRootView>;
}

export default function RootLayout() {
    return <SafeAreaProvider>
        <ThemeProvider>
            <InnerStack />
        </ThemeProvider>
    </SafeAreaProvider>;
}
