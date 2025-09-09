package com.ygss.backend.wmti.service;

import com.ygss.backend.wmti.dto.InvestorPersonalityQuestionDto;

import java.util.List;

public interface InvestorPersonalityService {
    List<InvestorPersonalityQuestionDto> getInvestorPersonalityQuestion();
}
