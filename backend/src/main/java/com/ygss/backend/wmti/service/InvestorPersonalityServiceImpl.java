package com.ygss.backend.wmti.service;

import com.ygss.backend.user.repository.UserAccountsRepository;
import com.ygss.backend.wmti.dto.InvestorPersonalityQuestionDto;
import com.ygss.backend.wmti.dto.InvestorPersonalityResultRequestDto;
import com.ygss.backend.wmti.dto.InvestorPersonalityResultResponseDto;
import com.ygss.backend.wmti.dto.InvestorPersonerlityListDto;
import com.ygss.backend.wmti.repository.RiskGradeOptionRepository;
import com.ygss.backend.wmti.repository.RiskGradeQuestionRepository;
import com.ygss.backend.wmti.repository.UserRiskGradeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvestorPersonalityServiceImpl implements InvestorPersonalityService{
    private final RiskGradeQuestionRepository riskGradeQuestionRepository;
    private final RiskGradeOptionRepository riskGradeOptionRepository;
    private final UserAccountsRepository userAccountsRepository;
    private final UserRiskGradeRepository userRiskGradeRepository;

    @Override
    public List<InvestorPersonalityQuestionDto> getInvestorPersonalityQuestion() {
        List<InvestorPersonalityQuestionDto> questionList = riskGradeQuestionRepository.selectAllQuestion();
        questionList.forEach((question) -> {
            question.setOptions(riskGradeOptionRepository.getQuestionOptions(Long.parseLong(String.valueOf(question.getNo()))));
            Collections.sort(question.getOptions(), (a,b) -> Integer.compare(a.getNo(), b.getNo()));
        });
        Collections.sort(questionList, (a,b) -> Integer.compare(a.getNo(), b.getNo()));
        // 시연용 -> 3가지 질문만 ㄱㄱ
        return questionList.subList(0,3);
    }

    @Override
    public InvestorPersonalityResultResponseDto updateInvestorPersonalityResult(String userEmail, InvestorPersonalityResultRequestDto request) {
        Long investorRiskGrade = calcRiskGrade(request.getScore());
        userAccountsRepository.updateUserRiskGrade(userEmail, investorRiskGrade);
        return InvestorPersonalityResultResponseDto.builder()
                .success(true)
                .investorRiskGrade(userRiskGradeRepository.selectRiskGradeById(investorRiskGrade)
                        .orElseThrow(() -> new IllegalArgumentException("Risk Grade Not Found")))
                .build();
    }

    @Override
    public List<InvestorPersonerlityListDto> loadInvestorPersonalityList() {
        List<InvestorPersonerlityListDto> investorPersonerlityList
                = userRiskGradeRepository.selectAllRiskGrade();
        if(investorPersonerlityList == null) throw new IllegalArgumentException("UnExpected Error");
        return investorPersonerlityList;
    }

//    private Long calcRiskGrade(Integer score) {
//        if (score >= 34) return 5L;
//        if (score >= 28) return 4L;
//        if (score >= 22) return 3L;
//        if (score >= 16) return 2L;
//        return 1L;
//    }

    private Long calcRiskGrade(Integer score) {
        if (score >= 15) return 5L;
        if (score >= 12) return 4L;
        if (score >= 10) return 3L;
        if (score >= 7) return 2L;
        return 1L;
    }
}
