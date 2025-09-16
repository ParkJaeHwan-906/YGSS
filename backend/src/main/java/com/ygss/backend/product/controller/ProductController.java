package com.ygss.backend.product.controller;

import com.ygss.backend.product.dto.ProductListRequestDto;
import com.ygss.backend.product.service.ProductServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<?> loadEtcDcProduct(ProductListRequestDto request) {
        try {
            return ResponseEntity.ok(productService.selectDcEtfProduct(request));
        } catch (Exception e) {
            log.error("Load DC ETF Product Failed : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }

    @GetMapping("/dc/pension")
    public ResponseEntity<?> loadPensionDcProduct(ProductListRequestDto request) {
        try {
            return ResponseEntity.ok(productService.selectDcPensionProduct(request));
        } catch (Exception e) {
            log.error("Load DC Pension Product Failed : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }

    @GetMapping("/dc/{retirePensionProductId}")
    public ResponseEntity<?> loadRetirePensionProductDetail(@PathVariable Long retirePensionProductId) {
        try {
            return ResponseEntity.ok(productService.selectRetirePensionProductById(retirePensionProductId));
        } catch (Exception e) {
            log.error("Load Retire Pension Product Detail Failed : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }
    @GetMapping("/dc/{retirePensionProductId}/graph")
    public ResponseEntity<?> loadRetirePensionProductDetailForGraph(@PathVariable Long retirePensionProductId) {
        try {
            return ResponseEntity.ok(productService.selectRetirePensionProductGraphById(retirePensionProductId));
        } catch (Exception e) {
            log.error("Load Retire Pension Product Detail Failed : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }
    @GetMapping("/dc/{retirePensionProductId}/timeline")
    public ResponseEntity<?> loadRetirePensionTimeLine(@PathVariable Long retirePensionProductId) {
        try {
            return ResponseEntity.ok(productService.selectRetirePensionDetailPriceLog(retirePensionProductId));
        } catch(Exception e) {
            log.error("Load Retire Pension Product Detail Time Line Failed : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }
    @GetMapping("/dc/bond")
    public ResponseEntity<?> loadbondProduct(ProductListRequestDto request) {
        try {
            return ResponseEntity.ok(productService.selectAllBondProduct(request));
        } catch (Exception e) {
            log.error("Load DC BOND Product Failed : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }

    @GetMapping("/dc/bond/{bondId}")
    public ResponseEntity<?> loadbondProduct(@PathVariable Long bondId) {
        try {
            return ResponseEntity.ok(productService.selectBondDetailById(bondId));
        } catch (Exception e) {
            log.error("Load DC BOND Product Detail Failed : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(false);
        }
    }
}
