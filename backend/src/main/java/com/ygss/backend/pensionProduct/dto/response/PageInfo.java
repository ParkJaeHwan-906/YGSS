package com.ygss.backend.pensionProduct.dto.response;

import lombok.Builder;
import lombok.Data;

/**
 * 페이징 정보 DTO
 */
@Data
@Builder
public class PageInfo {

    private int currentPage;
    private int totalPages;
    private long totalElements;
    private int size;
    private boolean hasNext;
    private boolean hasPrevious;
    private boolean isFirst;
    private boolean isLast;

    public static PageInfo of(int currentPage, int size, long totalElements) {
        int totalPages = (int) Math.ceil((double) totalElements / size);
        if (totalElements == 0) totalPages = 1;

        boolean hasNext = currentPage < totalPages;
        boolean hasPrevious = currentPage > 1;
        boolean isFirst = currentPage == 1;
        boolean isLast = currentPage >= totalPages;

        return PageInfo.builder()
                .currentPage(currentPage)
                .totalPages(totalPages)
                .totalElements(totalElements)
                .size(size)
                .hasNext(hasNext)
                .hasPrevious(hasPrevious)
                .isFirst(isFirst)
                .isLast(isLast)
                .build();
    }

    public String getSummary() {
        return String.format("%d/%d 페이지 (총 %,d개)", currentPage, totalPages, totalElements);
    }
}