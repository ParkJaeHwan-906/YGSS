import { Colors } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text } from "react-native";

type ItemCardProps = {
    id: number;
    title: string;
    rate: number;
    type: "ETF" | "펀드" | "BOND";
    icon?: any;
};

export default function ItemCard({ id, title, rate, type, icon }: ItemCardProps) {
    const isPositive = rate >= 0;
    const router = useRouter();

    const handlePress = () => {
        const idParam = String(id);
        if (type === "BOND") {
            router.push({ pathname: "/(app)/(tabs)/dc/bond/[id]", params: { id: idParam } });
        } else {
            router.push({ pathname: "/(app)/(tabs)/dc/etf_fund/[id]", params: { id: idParam } });
        }
    };

    // 1) 유니코드 안전 잘라내기(이모지/한글 포함)
    const truncate = (s: string, n = 30) => {
        const chars = Array.from(s ?? "");
        return chars.length > n ? chars.slice(0, n).join("") + "…" : s;
    };

    return (
        <Pressable onPress={handlePress} style={type === "BOND" ? styles.bondCard : type === "ETF" ? styles.etfCard : styles.fundCard}>
            {type === "BOND" ? <Text style={styles.bondbadgeText}>채권</Text> : type === "ETF" ? <Text style={styles.etfbadgeText}>ETF</Text> : <Text style={styles.fundbadgeText}>펀드</Text>}
            <Text style={styles.cardTitle}>{truncate(title)}</Text>
            <Text style={[styles.cardRate, isPositive ? styles.up : styles.down]}>
                {isPositive ? `+${rate.toFixed(2)}%` : `${rate.toFixed(2)}%`}
            </Text>
            {/* 타입에 따라 이미지 변경 */}
            <Image
                source={type === "ETF" ? require("@/assets/icon/etf.png") : type === "펀드" ? require("@/assets/icon/fund.png") : require("@/assets/icon/bond.png")}
                style={styles.cardBadge}
            />

        </Pressable>
    );
}

const CARD_W = 260;

export const cardConstants = {
    CARD_W,
    CARD_H: 220,
    SPACING: 18,
};

const styles = StyleSheet.create({
    etfCard: {
        width: CARD_W,
        height: 220,
        borderRadius: 20,
        padding: 18,
        backgroundColor: "#FFF7A6",
        justifyContent: "flex-start",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
    },
    bondCard: {
        width: CARD_W,
        height: 220,
        borderRadius: 20,
        padding: 18,
        backgroundColor: "#BFD7FF",
        justifyContent: "flex-start",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
    },
    fundCard: {
        width: CARD_W,
        height: 220,
        borderRadius: 20,
        padding: 18,
        backgroundColor: "#FFCEE6",
        justifyContent: "flex-start",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
    },
    cardTitle: { fontSize: 20, fontFamily: "BasicBold", color: Colors.black, textAlign: "center" },
    cardRate: { marginTop: 8, fontSize: 18, fontFamily: "BasicBold", textAlign: "center" },
    up: { color: "#FF2C2C" },
    down: { color: "#2F6FFF" },
    cardBadge: {
        width: 70,
        height: 70,
        resizeMode: "contain",
        position: "absolute",
        left: "50%",
        transform: [{ translateX: -15 }],
        bottom: 18,
    },
    bondbadgeText: {
        position: "absolute",
        bottom: 12,
        right: 12,
        backgroundColor: "#2F6FFF",
        color: "white",
        fontFamily: "BasicBold",
        fontSize: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        zIndex: 1,
    },
    etfbadgeText: {
        position: "absolute",
        bottom: 12,
        right: 12,
        backgroundColor: "#FABE34",
        color: "white",
        fontFamily: "BasicBold",
        fontSize: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        zIndex: 1,
    },
    fundbadgeText: {
        position: "absolute",
        bottom: 12,
        right: 12,
        backgroundColor: "#FF91B7",
        color: "white",
        fontFamily: "BasicBold",
        fontSize: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        zIndex: 1,
    },
});
