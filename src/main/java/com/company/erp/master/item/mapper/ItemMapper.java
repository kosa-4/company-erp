package com.company.erp.master.item.mapper;

import com.company.erp.master.item.dto.ItemListDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ItemMapper {
    List<ItemListDto> selectItemList();
}
