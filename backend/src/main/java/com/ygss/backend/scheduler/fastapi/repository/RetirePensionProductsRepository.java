package com.ygss.backend.scheduler.fastapi.repository;

import com.ygss.backend.scheduler.fastapi.dto.RetirePensionSimpleDto;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface RetirePensionProductsRepository {
    /**
     * 상품들의 예측 수익률을 업데이트 하기 위한 모든 상품 리스트를 불러온다.
     */
    @Select("SELECT id, product, reserve, expense_ratio FROM `retire_pension_products`")
    List<RetirePensionSimpleDto> selectRetirePensionProductList();

}
