package com.ygss.backend.market.controller;

import com.ygss.backend.market.dto.response.MarketDataResponse;
import com.ygss.backend.market.service.MarketService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("/market")
public class MarketController {

    private final MarketService marketService;

    @GetMapping()
    public ResponseEntity<?> getAllMarketData(){
        try{
            return ResponseEntity.status(HttpStatus.OK).body(marketService.getAllMarketData());
        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
