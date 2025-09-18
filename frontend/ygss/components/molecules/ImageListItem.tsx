// components/ImageListItem.tsx
import { Colors } from "@/src/theme/colors";
import { useRouter } from "expo-router";
import React from "react";
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from "react-native";

type ImageListItemProps = {
  id: number;
  type: "BOND" | "ETF_FUND";
  logo?: ImageSourcePropType;
  title: string;
  subTitle: string;
  rate: number;
  showDivider?: boolean; // 마지막 항목이면 false로
};

export default function ImageListItem({
  id,
  type,
  logo,
  title,
  subTitle,
  rate,
  showDivider = true,
}: ImageListItemProps & { id: number; type: "BOND" | "ETF_FUND" }) {
  const router = useRouter();
  const isUp = rate >= 0;
  const rateText = `${isUp ? "+" : ""}${rate.toFixed(1)}%`;
  const defaultLogo = require("@/assets/char/basicAlchi.png");

  const handlePress = () => {
    if (type === "BOND") {
      router.push(`/dc/bond/${id}`);
    } else {
      router.push(`/dc/etf_fund/${id}`);
    }
  };

  return (
    <Pressable onPress={handlePress} style={styles.itemWrap}>
      <View style={styles.row}>
        <View style={styles.logoStub}>
          <Image source={logo ?? defaultLogo} style={styles.logoImg} resizeMode="contain" />
        </View>

        <View style={styles.rowCenter}>
          <Text style={styles.rowTitle}>{title}</Text>
          <Text style={styles.rowSub}>{subTitle}</Text>
        </View>

        <Text style={isUp ? styles.rowRateUp : styles.rowRateDown}>{rateText}</Text>
      </View>

      {showDivider && <View style={styles.divider} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  itemWrap: { width: "100%" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  logoStub: {
    width: 60, height: 60,
    alignItems: "center", justifyContent: "center",
    marginRight: 8,
  },
  logoImg: { width: 60, height: 60 },
  rowCenter: { flex: 1 },
  rowTitle: { fontFamily: "BasicMedium", fontSize: 16, color: Colors.black },
  rowSub: { fontFamily: "BasicMedium", fontSize: 12, color: Colors.gray, marginTop: 4 },
  rowRateUp: { fontFamily: "BasicBold", fontSize: 15, color: "#FF2C2C" },
  rowRateDown: { fontFamily: "BasicBold", fontSize: 15, color: "#2F6FFF" },
  divider: { height: 1, backgroundColor: "#E5E5E5" },
});
