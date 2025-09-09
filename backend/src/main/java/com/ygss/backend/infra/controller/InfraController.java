package com.ygss.backend.infra.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
public class InfraController {
    @GetMapping("/infra")
    public ResponseEntity<?> checkConnection() {
        return ResponseEntity.ok("ok");
    }
}
