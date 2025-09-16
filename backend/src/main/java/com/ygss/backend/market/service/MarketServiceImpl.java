package com.ygss.backend.market.service;

import com.ygss.backend.market.dto.response.MarketDataResponse;
import com.ygss.backend.market.repository.MarketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Primary
public class MarketServiceImpl implements MarketService {

    private final MarketRepository marketRepository;
    @Override
    public List<MarketDataResponse> getAllMarketData() {
        return marketRepository.selectAllMarketData();
    }
}
