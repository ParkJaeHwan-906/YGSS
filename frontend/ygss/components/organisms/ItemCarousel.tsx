import { useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import ItemCard, { cardConstants } from "../molecules/ItemCard";

const API_URL = process.env.EXPO_PUBLIC_API_URL as string;

const { width } = Dimensions.get("window");
const { CARD_W, SPACING } = cardConstants;

const data = [
    { id: "1", title: "하나증권\nDC 투자 상품", rate: 92.54 },
    { id: "2", title: "삼성증권\nDC 투자 상품", rate: 15.32 },
    { id: "3", title: "미래에셋\nIRP 상품", rate: -4.12 },
];


export default function ItemCarousel() {
    const scrollX = useRef(new Animated.Value(0)).current;

    return (
        <View style={{ overflow: "visible", marginTop: 20, height: cardConstants.CARD_H + 40, }}>
            <Animated.FlatList
                data={data}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_W + SPACING}
                decelerationRate="fast"
                bounces={false}
                contentContainerStyle={{
                    // 부모 padding(16) 고려해서 보정
                    paddingHorizontal: (width - CARD_W) / 2 - 16,
                }}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: true }
                )}
                renderItem={({ item, index }) => {
                    const inputRange = [
                        (index - 1) * (CARD_W + SPACING),
                        index * (CARD_W + SPACING),
                        (index + 1) * (CARD_W + SPACING),
                    ];

                    const scale = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.9, 1.05, 0.9],
                        extrapolate: "clamp",
                    });

                    const translateY = scrollX.interpolate({
                        inputRange,
                        outputRange: [0, 20, 0],
                        extrapolate: "clamp",
                    });

                    return (
                        <Animated.View
                            style={{
                                transform: [{ scale }, { translateY }],
                                marginHorizontal: SPACING / 2,
                            }}
                        >
                            <ItemCard title={item.title} rate={item.rate} />
                        </Animated.View>
                    );
                }}
            />

        </View>
    );
}

const styles = StyleSheet.create({});
