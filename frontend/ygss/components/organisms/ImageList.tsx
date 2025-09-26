// components/organisms/ImageList.tsx

import ImageListItem from "@/components/molecules/ImageListItem";
import { Colors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useRef, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import HintBubble from "./HintBubble";

const screenWidth = Dimensions.get("window").width;
const bubbleWidth = screenWidth * 0.8;

export type ImageListData = {
  id: number,
  type: "ETF" | "펀드" | "BOND";
  logo?: any;
  title: string;
  subTitle: string;
  rate: number;
  from?: string;
};

type Props = {
  header?: string;
  items: ImageListData[];
  emptyText?: string;
  from?: string;
  initialCount?: number; // 기본 3개 노출
  step?: number;         // 클릭 시 5개씩 증가
};

export default function ImageList({
  items,
  header = "목록",
  // 로그인을 하지 않았을때 로그인을 하라는 emptyText
  emptyText = "로그인을 하시면\n많은 정보를 얻을 수 있어요 :)",
  from,
  initialCount = 3,
  step = 5,
}: Props) {
  const [visible, setVisible] = useState(initialCount);
  const [showHint, setShowHint] = useState(false);
  const [iconPos, setIconPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const iconRef = useRef<View>(null);

  const sliced = useMemo(() => items.slice(0, visible), [items, visible]);
  const hasMore = visible < items.length;
  const remain = items.length - visible;
  const onIconLayout = () => {
    if (iconRef.current) {
      iconRef.current.measureInWindow((x, y, w, h) => {
        // 아이콘 중앙 위쪽 좌표
        setIconPos({ x: x + w / 2, y: y });
      });
    }
  };

  const onMore = () => setVisible(v => Math.min(v + step, items.length));

  return (
    <View style={styles.wrap}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={styles.header}>{header}</Text>

        <Pressable
          onPress={() => {
            onIconLayout();
            setShowHint(true);
          }}
        >
          <View ref={iconRef}>
            <Ionicons name="information-circle-outline" size={24} color={Colors.gray} />
          </View>
        </Pressable>
      </View>

      {items.length === 0 ? (
        <Text style={styles.emptyText}>{emptyText}</Text>
      ) : (
        <>
          {sliced.map((it, idx) => (
            <ImageListItem
              key={`${it.title}-${idx}`}
              id={it.id}
              type={it.type}
              logo={it.logo}
              title={it.title}
              subTitle={it.subTitle}
              rate={it.rate}
              from={from}
              showDivider={idx < sliced.length - 1}
            />
          ))}

          {hasMore && (
            <Pressable style={styles.moreBtn} onPress={onMore} android_ripple={{ color: "#ddd" }}>
              <Ionicons name="chevron-down" size={16} color={Colors.black} />
              <Text style={styles.moreText}>{remain}개 더보기</Text>
            </Pressable>
          )}
        </>
      )}
      <HintBubble
        visible={showHint}
        onClose={() => setShowHint(false)}
        top={iconPos.y - 60}
        left={iconPos.x - bubbleWidth / 2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%", backgroundColor: Colors.white, paddingHorizontal: 16,
    paddingTop: 16, paddingBottom: 0,
  },
  header: {
    fontSize: 18,
    fontFamily: "BasicBold",
    marginBottom: 8,
    color: Colors.black,
  },
  emptyText: {
    fontSize: 12,
    fontFamily: "BasicMedium",
    color: Colors.gray,
    textAlign: "center",
    paddingVertical: 16,
  },
  moreBtn: {
    alignSelf: "center",
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  moreText: {
    fontSize: 13,
    fontFamily: "BasicMedium",
    color: Colors.black,
  },
});
