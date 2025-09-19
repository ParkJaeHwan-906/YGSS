import { useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import ItemCard, { cardConstants } from "../molecules/ItemCard";
import { ImageListData } from "./ImageList";

const { width } = Dimensions.get("window");
const { CARD_W, SPACING } = cardConstants;

type Props = {
    items: ImageListData[];
}

export default function ItemCarousel({ items }: Props) {
    const scrollX = useRef(new Animated.Value(0)).current;

    return (
        <View style={{ overflow: "visible", marginTop: 20, height: cardConstants.CARD_H + 40, }}>
            <Animated.FlatList
                data={items}
                keyExtractor={(item, idx) => `${item.title}-${idx}`}
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
