package com.company.erp.master.category.service;

import com.company.erp.master.category.dto.CategoryDto;
import com.company.erp.master.category.mapper.CategoryMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryService {
    @Autowired
    CategoryMapper categoryMapper;

    /* 조회 */
    // item class 조회
    public List<CategoryDto> getItemClassList(){
        return categoryMapper.selectItemClassList();
    }

    /* 저장 */
    @Transactional
    public void registerCategory(CategoryDto categoryDto){
        // 1. 중복 체크
        boolean existsCategory = categoryMapper.existsCategory(categoryDto);

        if(existsCategory){
            throw new RuntimeException("동일한 카테고리가 존재합니다.");
        }
        
        // 2. 중복 아닐 시
        categoryMapper.insertCategory(categoryDto);
    }

}
