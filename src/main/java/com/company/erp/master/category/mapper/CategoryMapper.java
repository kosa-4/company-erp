package com.company.erp.master.category.mapper;

import com.company.erp.master.category.dto.CategoryDto;

import java.util.List;

public interface CategoryMapper {
    List<CategoryDto> selectItemClassList();
    void insertCategory(CategoryDto categoryDto);
    boolean existsCategory(CategoryDto categoryDto);
}
