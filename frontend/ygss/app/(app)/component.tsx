import { Colors } from "@/src/theme/colors";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Dict from "@/components/molecules/Dict";
import ItemCard from "@/components/molecules/ItemCard";
import LinkCard from "@/components/molecules/LinkCard";
import ListItem from "@/components/molecules/ListItem";
import MyMoney from "@/components/molecules/MyMoney";
import PortfolioChart from "@/components/molecules/PortfolioChart";
import ImageList from "@/components/organisms/ImageList";

export default function ComponentsPage() {

  // 더미데이터
  const items = [
    { title: "롯데손해보험", subTitle: "롯데손해보험", rate: 10.5 },
    { title: "미국ETF", subTitle: "롯데손해보험", rate: -2.4 },
    { title: "삼성전자", subTitle: "국내주식", rate: 3.8 },
    { title: "현대자동차", subTitle: "국내주식", rate: -1.2 },
    { title: "카카오", subTitle: "국내주식", rate: 5.7 },
    { title: "LG화학", subTitle: "국내주식", rate: -0.9 },
    { title: "SK하이닉스", subTitle: "국내주식", rate: 8.3 },
    { title: "네이버", subTitle: "국내주식", rate: 2.1 },
    { title: "테슬라", subTitle: "해외주식", rate: 12.5 },
    { title: "애플", subTitle: "해외주식", rate: 4.6 },
    { title: "마이크로소프트", subTitle: "해외주식", rate: 6.7 },
    { title: "구글", subTitle: "해외주식", rate: -3.1 },
    { title: "아마존", subTitle: "해외주식", rate: 1.9 },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>컴포넌트 모아보기</Text>
        <Text style={styles.desc}>
          atoms / molecules / organisms 컴포넌트를 테스트하는 공간입니다.
        </Text>

        {/* ✅ 여기에 직접 컴포넌트들을 import 해서 배치하면 됩니다 */}
        <LinkCard
          title="카드타이틀"
          desc="카드설명"
          icon={require("@/assets/icon/bills.png")}
          onPress={() => { }}
        />
        <Dict title="DC" desc="DC형은 적립금을 운용하는 방법을 가입자가 결정하기 때문에, 운용의 성과에 따라 퇴직 후 받을 급여액이 달라져요. 쉽게 말해 어떤 투자 상품에 투자할지 직접 선택하는 것이기 때문에, 책임도 가입자가 져야 해요." />

        <ItemCard title="하나증권 DC 투자 상품" rate={92.54} icon={require("@/assets/icon/star.png")} />

        <PortfolioChart />
        <MyMoney rate={1.2} amount={1000000} />
        <ImageList items={items} />
        <View>
          {/* 낮음 */}
          <ListItem
            title="KODEX 200 미국채혼합 ETF ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ "
            subTitle="삼성자산운용"
            risk="낮음"
            rate={-1.23}
          />

          {/* 보통 */}
          <ListItem
            title="KODEX 200 미국채혼합 ETF"
            subTitle="삼성자산운용"
            risk="보통"
            rate={2.46}
          />

          {/* 다소높음 */}
          <ListItem
            title="KODEX 200 미국채혼합 ETF 라고 했잖아 왜 마키 안되냐고"
            subTitle="삼성자산운용"
            risk="다소높음"
            rate={+2.46}
          />

          {/* 높음 */}
          <ListItem
            title="KODEX 200 미국채혼합 ETF 이채연 바보"
            subTitle="삼성자산운용"
            risk="높음"
            rate={+12.4}
          />

          {/* 매우높음 */}
          <ListItem
            title="KODEX 200 미국채혼합 ETF"
            subTitle="삼성자산운용"
            risk="매우높음"
            rate={+92.54}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors?.back ?? "#F4F6FF",
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
});
