package com.company.erp.master.item.mapper;

import com.company.erp.master.item.dto.ItemDetailDto;
import com.company.erp.master.item.dto.ItemDto;

import com.company.erp.master.item.dto.ItemSearchDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

//@Mapper // MERGE 시 삭제
public interface ItemMapper {
    /* 조회 */
    // item 조회
    List<ItemDetailDto> selectItemList(ItemSearchDto searchDto);
    // item 수 계산
    int countItemList(ItemSearchDto searchDto);
    // 중복 여부 체크
    boolean existsByNameAndSpec(ItemDetailDto itemDetailDto);
    // 상세 품목 조회
    ItemDetailDto selectItemByCode(String code);

    /* 저장 */
    // 품목 마스터 저장
    void insertItemMTGL(ItemDetailDto itemDetailDto);
    // 품목 카테고리 저장
    void insertItemMTGC(ItemDetailDto itemDetailDto);
}
