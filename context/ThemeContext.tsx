import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorValue } from 'react-native';

export type ThemeType = {
    colors: {
        primary: ColorValue;
        primaryLight: ColorValue;
        secondary: ColorValue;
        background: ColorValue;
        surface: ColorValue;
        card: ColorValue;
        text: ColorValue;
        textSecondary: ColorValue;
        border: ColorValue;
        success: ColorValue;
        error: ColorValue;
        gradient: [ColorValue, ColorValue];
    };
}

const lightTheme: ThemeType = {
    colors: {
        primary: '#6366f1',
        primaryLight: '#a5b4fc',
        secondary: '#f59e0b',
        background: '#ffffff',
        surface: '#f8fafc',
        card: '#ffffff',
        text: '#1e293b',
        textSecondary: '#64748b',
        border: '#e2e8f0',
        success: '#10b981',
        error: '#ef4444',
        gradient: ['#6366f1', '#8b5cf6'],
    },
};

const darkTheme: ThemeType = {
    colors: {
        primary: '#818cf8',
        primaryLight: '#c7d2fe',
        secondary: '#fbbf24',
        background: '#0f172a',
        surface: '#1e293b',
        card: '#334155',
        text: '#f1f5f9',
        textSecondary: '#94a3b8',
        border: '#475569',
        success: '#34d399',
        error: '#f87171',
        gradient: ['#818cf8', '#a78bfa'],
    },
};

const ThemeContext = createContext({
    theme: lightTheme,
    isDark: false,
    toggleTheme: () => { },
});

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('theme');
            if (savedTheme) {
                setIsDark(savedTheme === 'dark');
            }
        } catch (error) {
            console.log('Error loading theme:', error);
        }
    };

    const toggleTheme = async () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        try {
            await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
        } catch (error) {
            console.log('Error saving theme:', error);
        }
    };

    const theme = isDark ? darkTheme : lightTheme;

    return <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
        {children}
    </ThemeContext.Provider>;
}
