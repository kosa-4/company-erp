package com.company.erp.master.category.service;

import com.company.erp.master.category.dto.CategoryDto;
import com.company.erp.master.category.dto.CategoryListDto;
import com.company.erp.master.category.mapper.CategoryMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class CategoryService {
    @Autowired
    CategoryMapper categoryMapper;

    /* 조회 */
    // 전체 카테고리 조회
    public List<CategoryListDto> getAllCategories(){
        return categoryMapper.selectAllCategories();
    }
    // 선택된 카테고리 목록 조회
    public List<CategoryListDto> getCategoryList(CategoryListDto  categoryListDto) {
        return categoryMapper.selectCategoryList(categoryListDto);
    }

    // 단일 카테고리 조회
    public CategoryListDto getCategoryByCode(String itemCls){
        return categoryMapper.selectCategoryByCode(itemCls);
    }

    /* 저장 */
    @Transactional
    public void registerCategory(List<CategoryListDto> categoryListDto){

        // 1. 데이터 가공 (프론트에서도 가능하나 조작 위험 방지를 위해 서비스에서 가공)
        List<CategoryListDto> filteredList = new ArrayList<>();

        for(CategoryListDto dto: categoryListDto){
            // 1-1. 분류 체크
            switch (dto.getItemLvl()){
                case 0:
                    filteredList.add(dto);
                    break;
                case 1, 2, 3:
                    String parentCls = dto.getParentItemCls();
                    String maxChildCls = categoryMapper.selectMaxChild(parentCls);
                    if(maxChildCls != null){
                        int itemCls =  Integer.parseInt(maxChildCls.substring(parentCls.length()));
                        dto.setItemCls(parentCls.concat(String.valueOf(itemCls + 1)));
                    } else {
                        dto.setItemCls(parentCls.concat("1"));
                    }

                    filteredList.add(dto);
                    break;

            }
        }
        // 2. 가공된 데이터가 존재하지 않을 시 예외 처리
        if(filteredList.isEmpty()){
            throw new RuntimeException("저장할 데이터가 없습니다.");
        }
        // 3. 중복 체크
        int existsCategory = categoryMapper.existsCategory(filteredList);

        if(existsCategory > 0){
            throw new RuntimeException("동일한 카테고리가 존재합니다.");
        }

        // 4. 최종 저장
        categoryMapper.insertCategory(filteredList);
    }

    /* 삭제 */
    @Transactional
    public void deleteCategory(String itemCls){
        // 1) 하위 카테고리 존재 여부 확인
        Boolean existsChild = categoryMapper.existsChildCate(itemCls);
        
        // 2) 하위 카테고리 존재 시 삭제 불가
        if(existsChild){
            throw new IllegalStateException("하위 카테고리가 존재하여 삭제가 불가능합니다.");
        }
        
        // 3) 카테고리 삭제
        categoryMapper.deleteCategory(itemCls);
    }

}
