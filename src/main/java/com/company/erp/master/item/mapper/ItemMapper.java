package com.company.erp.master.item.mapper;

import com.company.erp.master.item.dto.ItemDto;

import com.company.erp.master.item.dto.ItemSearchDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ItemMapper {
    /* 조회 */
    // item 조회
    List<ItemDto> selectItemList(ItemSearchDto searchDto);
    // item 수 계산
    int countItemList(ItemSearchDto searchDto);
    // 중복 item 체크
    int checkItemDuplicate(ItemDto itemDto);

    // item 등록
    void insertItem(ItemDto itemDto);
}
