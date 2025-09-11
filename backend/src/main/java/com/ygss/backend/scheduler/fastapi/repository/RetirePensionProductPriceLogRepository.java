package com.ygss.backend.scheduler.fastapi.repository;

import com.ygss.backend.scheduler.fastapi.dto.RetirePensionProductPriceLogSimpleDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface RetirePensionProductPriceLogRepository {
    @Select("""
            SELECT 
            rp.id AS 'retirePensionProductId',
            rp.product AS 'product',
            rpl.date AS 'date',
            rpl.init_price AS 'initPrice',
            rpl.final_price AS 'finalPrice',
            rpl.daily_rate AS 'dailyRate'
            FROM `retire_pension_product_price_log` rpl
            JOIN `retire_pension_products` rp ON rp.id = rpl.retire_pension_product_id
            WHERE rpl.retire_pension_product_id = #{retirePensionProductId};
            """)
    List<RetirePensionProductPriceLogSimpleDto> selectRetirePensionProductPriceLog(Long retirePensionProductId);

}
