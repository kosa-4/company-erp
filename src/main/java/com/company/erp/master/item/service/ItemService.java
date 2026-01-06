package com.company.erp.master.item.service;

import com.company.erp.master.item.dto.*;

import java.util.List;

public interface ItemService {
    /* 조회 */
    // 전체 혹은 검색 품목 조회 및 페이지 계산
    ItemResponseDto<ItemDetailDto> getItemList(ItemSearchDto searchDto);
    // 상세 품목 조회
    ItemDetailDto getItemDetail(String code);

    /* 등록 */
    // 품목 등록
    void registerItem(ItemDetailDto itemDetailDto);
}
