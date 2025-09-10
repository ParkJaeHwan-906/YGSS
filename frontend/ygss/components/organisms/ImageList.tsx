// components/organisms/ImageList.tsx

import ImageListItem from "@/components/molecules/ImageListItem";
import { Colors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

export type ImageListData = {
  logo?: any;
  title: string;
  subTitle: string;
  rate: number;
};

type Props = {
  items: ImageListData[];
  initialCount?: number; // 기본 3개 노출
  step?: number;         // 클릭 시 5개씩 증가
};

export default function ImageList({
  items,
  initialCount = 3,
  step = 5,
}: Props) {
  const [visible, setVisible] = useState(initialCount);

  const sliced = useMemo(() => items.slice(0, visible), [items, visible]);
  const hasMore = visible < items.length;
  const remain = items.length - visible;

  const onMore = () => setVisible(v => Math.min(v + step, items.length));

  return (
    <View style={styles.wrap}>
      {sliced.map((it, idx) => (
        <ImageListItem
          key={`${it.title}-${idx}`}
          logo={it.logo}
          title={it.title}
          subTitle={it.subTitle}
          rate={it.rate}
          showDivider={idx < sliced.length - 1}
        />
      ))}

      {hasMore && (
        <Pressable style={styles.moreBtn} onPress={onMore} android_ripple={{ color: "#ddd" }}>
            <Ionicons name="chevron-down" size={16} color={Colors.black} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%" },
  moreBtn: {
    alignSelf: "center",
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
