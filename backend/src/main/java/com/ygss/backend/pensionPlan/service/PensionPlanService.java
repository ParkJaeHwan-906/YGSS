package com.ygss.backend.pensionPlan.service;

import com.ygss.backend.pensionPlan.dto.request.PensionPlanSearchRequest;
import com.ygss.backend.pensionPlan.dto.response.PensionPlanSearchResponse;
import com.ygss.backend.pensionPlan.dto.response.PensionPlanSimpleResponse;

import java.util.List;

public interface PensionPlanService {
    public List<PensionPlanSearchResponse> searchAll(PensionPlanSearchRequest request);

    PensionPlanSearchResponse searchById(Long pensionPlanId);

    List<PensionPlanSimpleResponse> getAllPlanOf(int type);

}
