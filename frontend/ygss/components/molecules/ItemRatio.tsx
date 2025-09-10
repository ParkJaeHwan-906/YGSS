import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { Colors } from "@/src/theme/colors";

export default function ItemRatio() {
  const pieData = [
    { value: 20, color: "#E9EDF7" },
    { value: 15, color: "#FFE9B7" },
    { value: 25, color: "#A8B7D1" },
    { value: 30, color: "#8BB6FF" },
    { value: 10, color: "#6E7FA3" },
  ];

  return (
    <View style={styles.wrapGlow}>
      <View style={styles.card}>
        <Text style={styles.title}>KODEX 200 미국채혼합 ETF</Text>
        <PieChart
          donut
          radius={80}
          innerRadius={50}
          data={pieData}
          showText
          textColor={Colors.black}
          textSize={12}
          centerLabelComponent={() => (
            <Text style={{ fontSize: 16, fontFamily: "BasicBold" }}>ETF</Text>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapGlow: {
    padding: 10,
    borderRadius: 22,
    backgroundColor: Colors?.primary ?? "#4666FF",
  },
  card: {
    backgroundColor: Colors?.white ?? "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  title: {
    fontFamily: "BasicBold",
    fontSize: 18,
    color: Colors?.black ?? "#111",
    marginBottom: 12,
  },
});
