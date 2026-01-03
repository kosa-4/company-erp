package com.company.erp.master.item.service;

import com.company.erp.master.item.dto.ItemListDto;
import com.company.erp.master.item.dto.ItemSearchDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface ItemService {
    List<ItemListDto> getItemList(ItemSearchDto searchDto);
}
