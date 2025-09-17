// components/molecules/MyMoney.tsx
import { Colors } from "@/src/theme/colors";
import { Image, StyleSheet, Text, View } from "react-native";

interface MyMoneyProps {
  rate: number;       // 수익률 (%)
  amount: number;     // 현재 자산 (원 단위)
}

const toMan = (n: number) => Math.round(n / 10_000).toLocaleString("ko-KR");

export default function MyMoney({ rate, amount }: MyMoneyProps) {
  const rateColor = rate >= 0 ? "#E53935" : "#1E88E5"; // +빨강, -파랑

  return (
    <View style={styles.wrap}>
      {/* 타이틀 */}
      <Text style={styles.title}>내 자산 운용 현황</Text>

      {/* 본문 박스 */}
      <View style={styles.box}>
        {/* 왼쪽 아이콘 */}
        <Image
          source={require("@/assets/icon/chart2.png")}
          style={styles.icon}
          resizeMode="contain"
        />

        {/* 오른쪽 정보 */}
        <View style={styles.info}>
          <Text style={[styles.rate, { color: rateColor }]}>
            + {rate > 0 ? "+" : ""}
            {rate.toFixed(1)}%
          </Text>
          <Text style={styles.amount}>{toMan(amount)} 만원</Text>
          <Text style={styles.desc}>
            10년 기준 평균치를 계산한 값이에요
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    marginTop: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: "BasicBold",
    color: Colors.black,
    marginBottom: 12,
  },
  box: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
  },
  icon: {
    width: 80,
    height: 80,
  },
  info: {
    flex: 1,
  },
  rate: {
    fontSize: 16,
    fontFamily: "BasicBold",
    textAlign: "right",
    marginBottom: 4,
  },
  amount: {
    fontSize: 25,
    fontFamily: "BasicBold",
    textAlign: "right",
    color: Colors.black,
    marginBottom: 2,
  },
  desc: {
    fontSize: 11,
    color: Colors.gray,
    fontFamily: "BasicMedium",
    textAlign: "right",
  },
});
