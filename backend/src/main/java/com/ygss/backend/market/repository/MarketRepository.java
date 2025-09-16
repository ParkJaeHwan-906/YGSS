package com.ygss.backend.market.repository;

import com.ygss.backend.market.dto.response.MarketDataResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Repository;

import java.util.List;

@Mapper
@Repository
public interface MarketRepository {

    @Select({
            "SELECT ",
            "   `date`,",
            "   kospi,",
            "   oil_price,",
            "   interest_rate,",
            "   price_index,",
            "   cny_rate,",
            "   usd_rate,",
            "   jpy_rate",
            "FROM market",
            "ORDER BY `date` ASC"
    })
    public List<MarketDataResponse> selectAllMarketData();

}
