// components/molecules/MyMoney.tsx
import { Colors } from "@/src/theme/colors";
import { Image, StyleSheet, Text, View } from "react-native";

interface MyMoneyProps {
  // rate: number;       // 수익률 (%)
  amount: number;     // 현재 자산 (원 단위)
  from?: "mypage" | "home";
}

const toMan = (n: number) => Math.round(n / 10_000).toLocaleString("ko-KR");

export default function MyMoney({ amount, from = "mypage" }: MyMoneyProps) {

  return (
    <View style={styles.wrap}>
      {/* 타이틀 */}
      <Text style={styles.title}>나의 누적 퇴직 연금</Text>

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
          {amount === 0 ? (
            <Text style={styles.comment}>신입이신가요? {"\n"}퇴직연금을 시작해보세요!</Text>
          ) : (
            <Text style={styles.amount}>{toMan(amount)} 만원</Text>
          )}
          {from === "mypage" ? (
            <Text style={styles.desc}>* 수정페이지에서 수정 가능합니다</Text>
          ) : (
            <Text style={styles.mypagetext}>&gt; 마이페이지에서 확인하기</Text>
          )}
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
  comment: {
    fontSize: 15,
    color: Colors.gray,
    fontFamily: "BasicBold",
    textAlign: "center",
    marginBottom: 5,
  },
  mypagetext: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: "BasicBold",
    textAlign: "right",
  },
});
