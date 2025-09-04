import React from 'react';
import { StyleProp, ViewStyle, } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

import { Pressable } from "react-native";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function BouncyButton({ children, onPress, style = {}, popOut = false, disabled = false }:
    {
        children: React.ReactNode,
        onPress: () => void,
        style?: StyleProp<ViewStyle>,
        popOut?: boolean
        disabled?: boolean
    }) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedPressable
            onPressIn={() => {
                scale.value = withTiming(0.9, { duration: 150 });
            }}
            onPressOut={() => {
                scale.value = withSpring(1, !popOut ? {} : {
                    stiffness: 1000,
                    damping: 20,
                    mass: 4,
                    overshootClamping: undefined,
                    energyThreshold: 6e-9,
                });
            }}
            onPress={onPress}
            style={[animatedStyle, { justifyContent: "center", alignItems: "center" }, style]}
            disabled={disabled}
        >
            {children}
        </AnimatedPressable>
    );
}