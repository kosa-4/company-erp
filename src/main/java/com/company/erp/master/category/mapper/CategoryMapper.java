package com.company.erp.master.category.mapper;

import com.company.erp.master.category.dto.CategoryDto;
import com.company.erp.master.category.dto.CategoryListDto;

import java.util.List;

public interface CategoryMapper {
    List<CategoryListDto> selectCategoryList(CategoryListDto categoryListDto);
    void insertCategory(List<CategoryDto> categoryDto);
    int existsCategory(List<CategoryDto> categoryDto);
    boolean existsParentCategory(String parentCls);
}
