package com.company.erp.master.item.service;

import com.company.erp.master.item.dto.ItemListDto;
import com.company.erp.master.item.dto.ItemResponseDto;
import com.company.erp.master.item.dto.ItemSearchDto;

import java.util.List;

public interface ItemService {
    List<ItemListDto> getItemList(ItemSearchDto searchDto);
    int countItemList(ItemSearchDto searchDto);
    ItemResponseDto<ItemListDto> getItemPage(ItemSearchDto searchDto);
}
