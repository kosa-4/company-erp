package com.company.erp.master.item.service;

import com.company.erp.master.item.dto.*;
import com.company.erp.master.item.mapper.ItemMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class ItemServiceImpl implements ItemService {
    @Autowired
    ItemMapper itemMapper;

    @Override
    public List<ItemDto> getItemList(ItemSearchDto searchDto) {

        return itemMapper.selectItemList(searchDto);
    }

    @Override
    public int countItemList(ItemSearchDto searchDto) {
        return itemMapper.countItemList(searchDto);
    }

    @Override
    public ItemResponseDto<ItemDto> getItemPage(ItemSearchDto searchDto) {
        int totalCount = countItemList(searchDto);
        int totalPage = (int)Math.ceil((double) totalCount / searchDto.getPageSize());
        return new ItemResponseDto<ItemDto>(
                getItemList(searchDto),
                searchDto.getPage(),
                searchDto.getPageSize(),
                totalPage,
                totalCount
        );
    }

    @Override
    @Transactional
    public void registerItem(ItemDto itemDto) {
        // 1. 중복 체크
        int duplicateCount = itemMapper.checkItemDuplicate(itemDto);
        if(duplicateCount > 0){
            throw new RuntimeException("동일한 이름과 규격의 품목이 존재합니다.");
        }

        // 2. 중복 아닐 시
        itemMapper.insertItem(itemDto);
    }
}
