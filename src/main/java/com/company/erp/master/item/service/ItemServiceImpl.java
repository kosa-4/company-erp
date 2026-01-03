package com.company.erp.master.item.service;

import com.company.erp.master.item.dto.ItemListDto;
import com.company.erp.master.item.dto.ItemSearchDto;
import com.company.erp.master.item.mapper.ItemMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ItemServiceImpl implements ItemService {
    @Autowired
    ItemMapper itemMapper;

    @Override
    public List<ItemListDto> getItemList(ItemSearchDto searchDto) {

        return itemMapper.selectItemList(searchDto);
    }
}
