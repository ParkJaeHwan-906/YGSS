package com.ygss.backend.recommend.component;

import com.ygss.backend.recommend.dto.AllocationDto;
import com.ygss.backend.recommend.dto.ProductRequestDto;
import com.ygss.backend.recommend.dto.RecommendPortfolioResponse;
import org.ojalgo.optimisation.ExpressionsBasedModel;
import org.ojalgo.optimisation.Expression;
import org.ojalgo.optimisation.Optimisation;
import org.ojalgo.optimisation.Variable;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class PortfolioOptimizer {
    // Allocation / PortfolioResult 클래스 정의는 생략(기존 것 사용)

    public RecommendPortfolioResponse optimize(List<ProductRequestDto> products) {
        int n = products.size();
        if (n == 0) {
            return RecommendPortfolioResponse.builder()
                    .totalExpectedReturn(0.0)
                    .allocations(List.of())
                    .build();
        }

        ExpressionsBasedModel model = new ExpressionsBasedModel();

        // 1) 변수 생성 (model.newVariable(...).lower(...).upper(...))
        Variable[] weights = new Variable[n];
        for (int i = 0; i < n; i++) {
            weights[i] = model.newVariable("w_" + i)
                    .lower(0.0)   // 하한 0
                    .upper(0.5);  // 상한 0.5 (50%)
            // model.newVariable(...)이 모델에 변수 등록까지 해줍니다.
        }

        // 2) 합 = 1 제약
        Expression sumExpr = model.addExpression("sum_constraint").level(1.0);
        for (int i = 0; i < n; i++) {
            sumExpr.set(weights[i], 1.0);
        }

        // 3) 목적식: 기대수익률 최대화 (선형)
        double[] predictedReturns = products.stream()
                .mapToDouble(p -> p.getPredictedReturn() != null ? p.getPredictedReturn() : 0.0)
                .toArray();

        Expression obj = model.addExpression("maximize_return").weight(1.0);
        for (int i = 0; i < n; i++) {
            obj.set(weights[i], predictedReturns[i]);
        }

        // 4) 최적화 실행
        Optimisation.Result result = model.maximise();

        // 5) 결과 취득 — 여기서 Access1D 타입 import 불필요: result.toRawCopy1D() 사용
        double[] optimalWeights;
        if (result != null && result.getState() != null && result.getState().isFeasible()) {
            optimalWeights = result.toRawCopy1D();  // <-- 핵심: Access1D import 불필요
        } else {
            optimalWeights = new double[n];
            Arrays.fill(optimalWeights, 1.0 / n); // fallback
        }

        // 6) 매핑
        List<AllocationDto> allocations = new ArrayList<>(n);
        double maxReturn = 0.0;
        for (int i = 0; i < n; i++) {
            double w = optimalWeights[i];
            double r = predictedReturns[i];

            allocations.add(AllocationDto.builder()
                            .assetCode(products.get(i).getId())
                            .expectedReturn(r)
                            .allocationPercentage(r)
                            .build());
            maxReturn += w * r;
        }
        allocations.sort((a, b) -> {
            if(b.getAllocationPercentage() == a.getAllocationPercentage()) Double.compare(b.getExpectedReturn(), a.getExpectedReturn());
            return Double.compare(b.getAllocationPercentage(), a.getAllocationPercentage());
        });
        return RecommendPortfolioResponse.builder()
                .totalExpectedReturn(maxReturn)
                .allocations(allocations.subList(0,Math.min(allocations.size(), 5)))
                .build();
    }
}

