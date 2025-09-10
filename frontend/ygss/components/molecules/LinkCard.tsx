import { Text, TouchableOpacity, StyleSheet, Image, ImageSourcePropType } from "react-native";
import { Colors } from "@/src/theme/colors";

type LinkCardProps = {
  title: string;
  desc: string;
  icon: ImageSourcePropType;
  onPress: () => void;
  bg?: "basic" | "primary";   // 기본 white, primary는 파랑
};

export default function LinkCard({ title, desc, icon, onPress, bg = "basic" }: LinkCardProps) {
  const isPrimary = bg === "primary";

  return (
    <TouchableOpacity
      style={[
        styles.box,
        { backgroundColor: isPrimary ? Colors?.primary ?? "#4666FF" : Colors?.white ?? "#FFFFFF" },
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Text
        style={[
          styles.boxTitle,
          isPrimary ? styles.textLight : { color: Colors?.black ?? "#111" },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.boxDesc,
          isPrimary ? styles.textLightSub : { color: Colors?.black ?? "#333" },
        ]}
      >
        {desc}
      </Text>
      <Image source={icon} style={styles.boxIcon} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  box: {
    width: "100%",
    height: 160,
    borderRadius: 16,
    padding: 16,
    overflow: "hidden",
    position: "relative",
    shadowColor: Colors?.primary ?? "#4666FF",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  boxTitle: { fontFamily: "BasicBold", fontSize: 18, marginBottom: 6 },
  boxDesc: { fontFamily: "BasicMedium", fontSize: 12, lineHeight: 18 },
  textLight: { color: "#FFFFFF" },
  textLightSub: { color: "rgba(255,255,255,0.9)" },
  boxIcon: {
    width: 60,
    height: 60,
    position: "absolute",
    right: 12,
    bottom: 12,
    resizeMode: "contain",
  },
});
