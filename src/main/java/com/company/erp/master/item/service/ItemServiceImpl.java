package com.company.erp.master.item.service;

import com.company.erp.master.item.dto.ItemListDto;
import com.company.erp.master.item.mapper.ItemMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemServiceImpl implements ItemService {
    @Autowired
    ItemMapper itemMapper;

    @Override
    public List<ItemListDto> getItemList() {
        return itemMapper.selectItemList();
    }
}
