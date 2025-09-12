package com.ygss.backend.product.controller;

import com.ygss.backend.product.dto.ProductListRequestDto;
import com.ygss.backend.product.service.ProductServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/product")
@RequiredArgsConstructor
public class ProductController {
    private final ProductServiceImpl productService;

    @GetMapping("/dc")
    public ResponseEntity<?> loadAllDcProduct(ProductListRequestDto request) {
        try {
            return ResponseEntity.ok(productService.selectAllDcProduct(request));
        } catch (Exception e) {
            log.error("Load All DC Product Failed : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }

    @GetMapping("/dc/etf")
    public ResponseEntity<?> loadEtcDcProduct() {
        return ResponseEntity.ok("dc/etf");
    }

    @GetMapping("/dc/pension")
    public ResponseEntity<?> loadPensionDcProduct() {
        return ResponseEntity.ok("dc/pension");
    }

    @GetMapping("/dc/bond")
    public ResponseEntity<?> loadBondDcProduct() {
        return ResponseEntity.ok("dc/bond");
    }
}
