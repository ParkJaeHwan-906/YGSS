package com.ygss.backend.product.service;

import com.ygss.backend.product.dto.ProductListRequestDto;
import com.ygss.backend.product.dto.RetirePensionProductResponseDto;
import com.ygss.backend.product.repository.RetirePensionProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final RetirePensionProductRepository retirePensionProductRepository;
    @Override
    public List<RetirePensionProductResponseDto> selectAllDcProduct(ProductListRequestDto request) {
        return retirePensionProductRepository.selectAllDcProduct(request.sortToString());
    }
}
