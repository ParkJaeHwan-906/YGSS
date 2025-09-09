package com.ygss.backend.wmti.service;

import com.ygss.backend.wmti.dto.InvestorPersonalityQuestionDto;
import com.ygss.backend.wmti.repository.RiskGradeOptionRepository;
import com.ygss.backend.wmti.repository.RiskGradeQuestionRepository;
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
}
