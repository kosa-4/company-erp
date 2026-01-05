package com.company.erp.master.item.service;

import com.company.erp.master.item.dto.*;

import java.util.List;

public interface ItemService {
    /* 조회 */
    // 전체 or 검색 품목 조회
    List<ItemDto> getItemList(ItemSearchDto searchDto);
    // 검색 품목 수 계산
    int countItemList(ItemSearchDto searchDto);
    // 검색 품목 조회 및 페이지 계산
    ItemResponseDto<ItemDto> getItemPage(ItemSearchDto searchDto);

    /* 등록 */
    // 품목 등록
    void registerItem(ItemDto itemDto);
}
