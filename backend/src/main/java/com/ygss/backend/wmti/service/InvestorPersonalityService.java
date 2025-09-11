package com.ygss.backend.wmti.service;

import com.ygss.backend.wmti.dto.InvestorPersonalityQuestionDto;
import com.ygss.backend.wmti.dto.InvestorPersonalityResultRequestDto;
import com.ygss.backend.wmti.dto.InvestorPersonalityResultResponseDto;
import com.ygss.backend.wmti.dto.InvestorPersonerlityListDto;

import java.util.List;

public interface InvestorPersonalityService {
    List<InvestorPersonalityQuestionDto> getInvestorPersonalityQuestion();
    InvestorPersonalityResultResponseDto updateInvestorPersonalityResult(String userEmail, InvestorPersonalityResultRequestDto request);
    List<InvestorPersonerlityListDto> loadInvestorPersonalityList();
}
