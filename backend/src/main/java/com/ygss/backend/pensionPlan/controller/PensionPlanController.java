package com.ygss.backend.pensionPlan.controller;

import com.ygss.backend.pensionPlan.dto.request.PensionPlanSearchRequest;
import com.ygss.backend.pensionPlan.service.PensionPlanServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pension/plan")
@RequiredArgsConstructor
public class PensionPlanController {

    private final PensionPlanServiceImpl pensionPlanService;

    @GetMapping()
    public ResponseEntity<?> getAllPensionPlans (@ModelAttribute PensionPlanSearchRequest request)
    {
        try{
            return ResponseEntity.ok().body(pensionPlanService.searchAll(request));
        }catch (Exception e){
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    public ResponseEntity<?> getPensionPlanById(@RequestParam Long PensionPlanId){
        try{
            return ResponseEntity.ok().body(pensionPlanService.searchById(PensionPlanId));
        }catch (Exception e){
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
