// components/ImageListItem.tsx
import { Colors } from "@/src/theme/colors";
import React from "react";
import { Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native";

type ImageListItemProps = {
  logo?: ImageSourcePropType;
  title: string;
  subTitle: string;
  rate: number;
  showDivider?: boolean; // 마지막 항목이면 false로
};

export default function ImageListItem({
  logo,
  title,
  subTitle,
  rate,
  showDivider = true,
}: ImageListItemProps) {
  const isUp = rate >= 0;
  const rateText = `${isUp ? "+" : ""}${rate.toFixed(1)}%`;
  const defaultLogo = require("@/assets/char/basicAlchi.png");

  return (
    <View style={styles.itemWrap}>
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
    </View>
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
    width: 70, height: 70,
    alignItems: "center", justifyContent: "center",
    marginRight: 12,
  },
  logoImg: { width: 60, height: 60 },
  rowCenter: { flex: 1 },
  rowTitle: { fontFamily: "BasicMedium", fontSize: 16, color: Colors.black },
  rowSub: { fontFamily: "BasicMedium", fontSize: 12, color: Colors.gray, marginTop: 4 },
  rowRateUp: { fontFamily: "BasicBold", fontSize: 14, color: "#FF2C2C" },
  rowRateDown: { fontFamily: "BasicBold", fontSize: 14, color: "#2F6FFF" },
  divider: { height: 1, backgroundColor: "#E5E5E5" },
});
