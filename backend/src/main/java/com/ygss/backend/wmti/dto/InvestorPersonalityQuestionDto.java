package com.ygss.backend.wmti.dto;

import lombok.Data;

import java.util.Collections;
import java.util.List;

@Data
public class InvestorPersonalityQuestionDto {
    private Integer no;
    private String question;
    private List<InvestorPersonalityOptionDto> options;
}
