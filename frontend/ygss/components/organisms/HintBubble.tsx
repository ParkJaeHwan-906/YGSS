import { Colors } from "@/src/theme/colors";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
    visible: boolean;
    onClose: () => void;
    message?: string;
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    backdropClosable?: boolean;
};

export default function HintBubble({
    visible,
    onClose,
    message = "AI를 활용한 3개월 평균\n예측 수익률 입니다.",
    top,
    left,
    right,
    bottom,
    backdropClosable = true,
}: Props) {
    return (
        <Modal transparent visible={visible} animationType="fade">
            <Pressable
                style={styles.backdrop}
                onPress={backdropClosable ? onClose : undefined}
            >
                <View pointerEvents="box-none" style={styles.full}>
                    <View
                        style={[
                            styles.bubbleWrap,
                            { top, left, right, bottom },
                        ]}
                    >
                        {/* 말풍선 본문 */}
                        <View style={styles.bubble}>
                            <Text style={styles.text}>{message}</Text>
                        </View>

                        {/* 꼬리 */}
                        <View style={styles.tailContainer}>
                            <View style={styles.tail} />
                        </View>
                    </View>
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
    },
    full: { flex: 1 },
    bubbleWrap: {
        position: "absolute",
        maxWidth: 280,
        alignItems: "flex-end",
    },
    bubble: {
        backgroundColor: Colors.white,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    text: {
        fontSize: 11,
        lineHeight: 18,
        color: "#757575",
        fontFamily: "BasicLight",
    },
    iconWrap: {
        marginTop: 6,
        alignItems: "flex-end", // 오른쪽 정렬
    },
    tailContainer: {
        alignItems: "flex-end",
        paddingRight: 18,
    },
    tail: {
        width: 10,
        height: 10,
        backgroundColor: Colors.white,
        transform: [{ rotate: "45deg" }],
        marginTop: -3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
});
