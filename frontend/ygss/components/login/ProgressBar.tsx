// components/login/ProgressBar.tsx
import * as Progress from "react-native-progress";

export default function ProgressBar({ step, totalSteps }: { step: number; totalSteps: number }) {
    return (
        <Progress.Bar
            progress={step / totalSteps}   // 진행 비율
            width={null}                   // 화면 가로 전체 차지
            height={6}
            color="#788BFF"                // 채워진 색
            unfilledColor="#D9F4FF"           // 배경 색
            borderWidth={0}
            animated={true}
            style={{ marginBottom: 16 }}
        />
    );
}
