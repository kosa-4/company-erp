package com.company.erp.master.category.mapper;

import com.company.erp.master.category.dto.CategoryDto;
import com.company.erp.master.category.dto.CategoryListDto;
import com.company.erp.master.category.dto.CategoryUpdateDto;

import java.util.List;

public interface CategoryMapper {
    /* 조회 */
    // 1. 전체 카테고리 조회
    List<CategoryListDto> selectAllCategories();
    // 2. 선택된 카테고리 조회
    List<CategoryListDto> selectCategoryList(CategoryListDto categoryListDto);
    // 3. 단일 카테고리 조회
    CategoryListDto selectCategoryByCode(String itemCls);
    // 4. 자식 카테고리 마지막 코드번호 조회
    String selectMaxChild(String parentItemCls);
    // 5. 중복 여부 조회
    int existsCategory(List<CategoryListDto> categoryListDto);
    // 6. 자식 여부 조회
    boolean existsChildCate(String itemCls);
    // 7. 품목 코드 중복 여부 조회
    int checkCodeDuplicate(List<CategoryListDto> rootItems);

    /* 저장 */
    // 1. 복수 카테고리 저장
    void insertCategory(List<CategoryListDto> categoryListDto);

    /* 삭제 및 수정 */
    int updateCategory(CategoryUpdateDto categoryUpdateDto);
    //boolean existsParentCategory(String parentCls);
}
