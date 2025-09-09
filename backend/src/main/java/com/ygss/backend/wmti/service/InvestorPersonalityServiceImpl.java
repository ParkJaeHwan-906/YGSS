package com.ygss.backend.wmti.service;

import com.ygss.backend.user.repository.UserAccountsRepository;
import com.ygss.backend.wmti.dto.InvestorPersonalityQuestionDto;
import com.ygss.backend.wmti.dto.InvestorPersonalityResultRequestDto;
import com.ygss.backend.wmti.dto.InvestorPersonalityResultResponseDto;
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
        return questionList;
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

    private Long calcRiskGrade(Integer score) {
        if (score >= 34) return 5L;
        if (score >= 28) return 4L;
        if (score >= 22) return 3L;
        if (score >= 16) return 2L;
        return 1L;
    }
}
