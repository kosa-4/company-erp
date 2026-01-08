package com.company.erp.master.category.service;

import com.company.erp.master.category.dto.CategoryDto;
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
    // item class 조회
    public List<CategoryDto> getItemClassList(){
        return categoryMapper.selectItemClassList();
    }

    /* 저장 */
    @Transactional
    public void registerCategory(List<CategoryDto> categoryDto){

        // 1. 데이터 가공 (프론트에서도 가능하나 조작 위험 방지를 위해 서비스에서 가공)
        List<CategoryDto> filteredList = new ArrayList<>();

        for(CategoryDto dto: categoryDto){
            // 1-1. 분류 체크
            switch (dto.getItemCls().length()){
                case 2:
                    dto.setParentItemCls(null);
                    dto.setItemLvl(0);

                    filteredList.add(dto);
                    break;
                case 3:
                    String parentCls = dto.getItemCls().substring(0,2);

                    // 1-2. 부모 클래스 존재 여부 확인
                    if(!categoryMapper.existsParentCategory(parentCls)){
                        throw new RuntimeException("존재하지 않는 부모 코드입니다.");
                    }
                    dto.setParentItemCls(parentCls);
                    dto.setItemLvl(1);

                    filteredList.add(dto);
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

}
