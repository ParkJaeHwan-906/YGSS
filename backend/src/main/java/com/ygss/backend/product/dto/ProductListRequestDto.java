package com.ygss.backend.product.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
public class ProductListRequestDto {
    private Integer sort = 0;

    public String sortToString() {
        return (sort == null||sort == 0)? "DESC" : "ASC";
    }
}
