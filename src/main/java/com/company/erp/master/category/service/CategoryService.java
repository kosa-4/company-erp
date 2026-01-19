package com.company.erp.master.category.service;

import com.company.erp.common.session.SessionUser;
import com.company.erp.master.category.dto.CategoryDto;
import com.company.erp.master.category.dto.CategoryListDto;
import com.company.erp.master.category.dto.CategoryUpdateDto;
import com.company.erp.master.category.mapper.CategoryMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

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
    public void registerCategory(List<CategoryListDto> categoryListDto, SessionUser loginUser){

        // 1. 데이터 가공 (프론트에서도 가능하나 조작 위험 방지를 위해 서비스에서 가공)
        List<CategoryListDto> filteredList = new ArrayList<>();
        
        // 2. max 값을 담을 map 생성
        // db에서 불러오면 insert 되기 전에 불러오므로 계속 같은 최댓값 반환
        Map<String, Integer> maxChildClassMap = new HashMap<>();

        for(CategoryListDto dto: categoryListDto){

            dto.setCreatedAt(LocalDate.now());
            dto.setCreatedBy(loginUser.getUserId());
            // 1-1. 분류 체크
            switch (dto.getItemLvl()){
                case 0:
                    filteredList.add(dto);
                    break;
                case 1, 2, 3:
                    String parentCls = dto.getParentItemCls();
                    
                    // 1) 생성할 카테고리의 시작 숫자 세팅
                    // 최초 한번만 실행
                    if(!maxChildClassMap.containsKey(parentCls)){
                        String maxChildCls = categoryMapper.selectMaxChild(parentCls);
                        int startNum = 1;
                        if(maxChildCls != null){
                            startNum = Integer.parseInt(maxChildCls.substring(parentCls.length())) + 1;
                        }
                        maxChildClassMap.put(parentCls, startNum);
                    }
                    
                    // 2) 입력할 숫자 map에서 반환
                    int currentNum = maxChildClassMap.get(parentCls);

                    dto.setItemCls(parentCls.concat(String.valueOf(currentNum)));
                    filteredList.add(dto);

                    // 3) 숫자 제한 체크
                    if(currentNum + 1 > 9){
                        throw new IllegalArgumentException("[" + parentCls + "] 카테고리의 자식 생성 한도(9개)를 초과했습니다.");
                    }

                    // 4) 다음 숫자 map에 저장
                    maxChildClassMap.put(parentCls, currentNum + 1);
                    break;
            }
        }

        // 2. 가공된 데이터가 존재하지 않을 시 예외 처리
        if(filteredList.isEmpty()){
            throw new NullPointerException("저장할 데이터가 없습니다.");
        }
        // 3. 중복 체크
        int existsCategory = categoryMapper.existsCategory(filteredList);

        if(existsCategory > 0){
            throw new IllegalStateException("동일한 카테고리가 존재합니다.");
        }

        // 4. 최종 저장
        categoryMapper.insertCategory(filteredList);
    }

    /* 삭제 */
    @Transactional
    public void deleteCategory(String itemCls, SessionUser loginUser){
        // 1) 카테고리 존재 여부 확인
        CategoryListDto existsCategory = categoryMapper.selectCategoryByCode(itemCls);

        if(existsCategory == null){
            throw new NoSuchElementException("카테고리가 존재하지 않습니다");
        }
        // 2) 하위 카테고리 존재 여부 확인
        boolean existsChild = categoryMapper.existsChildCate(itemCls);
        
        if(existsChild){
            throw new IllegalStateException("하위 카테고리가 존재하여 삭제가 불가능합니다.");
        }

        
        // 3) 카테고리 삭제
        CategoryUpdateDto  categoryUpdateDto = new CategoryUpdateDto();
        categoryUpdateDto.setItemCls(itemCls);
        categoryUpdateDto.setDelFlag("Y");
        categoryUpdateDto.setModifiedBy(loginUser.getUserId());

        categoryMapper.updateCategory(categoryUpdateDto);
    }

}
