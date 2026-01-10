package com.company.erp.master.category.mapper;

import com.company.erp.master.category.dto.CategoryDto;
import com.company.erp.master.category.dto.CategoryListDto;

import java.util.List;

public interface CategoryMapper {
    List<CategoryListDto> selectCategoryList(CategoryListDto categoryListDto);
    CategoryListDto selectCategoryByCode(String itemCls);
    void insertCategory(List<CategoryListDto> categoryListDto);
    int existsCategory(List<CategoryListDto> categoryListDto);
    boolean existsParentCategory(String parentCls);
}
