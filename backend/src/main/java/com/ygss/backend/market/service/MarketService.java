package com.ygss.backend.market.service;


import com.ygss.backend.market.dto.response.MarketDataResponse;

import java.util.List;

public interface MarketService {
    List<MarketDataResponse> getAllMarketData();
}
