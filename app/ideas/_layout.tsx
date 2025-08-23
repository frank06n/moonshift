import { Stack } from "expo-router";
import { useTheme } from "../../context/ThemeContext";

export default function IdeasLayout() {
    const { theme } = useTheme();

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: theme.colors.background as string,
                    //   shadowColor: "transparent",
                    //   elevation: 0,
                },
                headerShown: false,
                headerTintColor: theme.colors.text as string,
                headerTitleStyle: {
                    fontFamily: "Inter-Bold",
                    fontSize: 18,
                },
            }}
        >
            <Stack.Screen name="index" options={{ title: "All Ideas" }} />
            <Stack.Screen name="detail" options={{ title: "Idea Details" }} />
        </Stack>
    );
}
