package com.ygss.backend.pensionPlan.service;

import com.ygss.backend.pensionPlan.dto.request.PensionPlanSearchRequest;
import com.ygss.backend.pensionPlan.dto.response.PensionPlanSearchResponse;
import com.ygss.backend.pensionPlan.dto.response.PensionPlanSimpleResponse;
import com.ygss.backend.pensionPlan.repository.PensionPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Transactional
@Service
@Slf4j
@RequiredArgsConstructor
public class PensionPlanServiceImpl implements PensionPlanService{

    private final PensionPlanRepository pensionPlanRepository;

    @Override
    public List<PensionPlanSearchResponse> searchAll(PensionPlanSearchRequest searchDto) {
//        log.info("퇴직연금 수익률 목록 조회 - 검색조건: {}", searchDto);
        List<PensionPlanSearchResponse> result = pensionPlanRepository.selectPensionPlans(searchDto);
        log.info("퇴직연금 수익률 목록 조회 완료 - 조회 건 수: {}", result.size());
        return result;
    }

    @Override
    public PensionPlanSearchResponse searchById(Long pensionPlanId) {
//        log.info("퇴직연금 단일 상품 조회 - Id: {}", pensionPlanId);
        Optional<PensionPlanSearchResponse> result = pensionPlanRepository.selectPensionPlanById(pensionPlanId);
        return pensionPlanRepository.selectPensionPlanById(pensionPlanId)
                .orElse(null);
    }

    @Override
    public List<PensionPlanSimpleResponse> getAllPlanOf(int type) {
        return pensionPlanRepository.selectAllPlanOf(type);
    }


}

