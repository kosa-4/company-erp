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
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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
    public void registerCategory(List<CategoryListDto> categoryListDtoList, SessionUser loginUser){

        // 1. 데이터 가공 (프론트에서도 가능하나 조작 위험 방지를 위해 서비스에서 가공)
        List<CategoryListDto> filteredList = new ArrayList<>();
        
        // 2. max 값을 담을 map 생성
        // db에서 불러오면 insert 되기 전에 불러오므로 계속 같은 최댓값 반환
        Map<String, Integer> maxChildClassMap = new HashMap<>();

        // ==========================================================
        // [1. 최상위(Level 0) 코드 중복 검사] - 여기가 핵심입니다!
        // ==========================================================
        // 사용자가 직접 입력한 코드가 이미 살아있는지 확인해야 덮어쓰기를 막을 수 있습니다.

        // Level 0인 것들만 추려냄 (자식 코드는 어차피 자동생성이라 중복 안 됨)
        List<CategoryListDto> rootItems = categoryListDtoList.stream()
                .filter(dto -> dto.getItemLvl() == 0)
                .collect(Collectors.toList());

        if (!rootItems.isEmpty()) {
            int duplicateCount = categoryMapper.checkCodeDuplicate(rootItems);
            if (duplicateCount > 0) {
                // 살아있는 코드가 발견되면 즉시 에러 발생 -> 덮어쓰기 방지!
                throw new IllegalStateException("이미 존재하는 카테고리 코드가 있습니다. (중복된 코드)");
            }
        }

        // ==========================================================
        // [2. 이름 중복 검사] (기존 로직)
        // ==========================================================
        int nameCount = categoryMapper.existsCategory(categoryListDtoList);
        if (nameCount > 0) {
            throw new IllegalStateException("이미 사용 중인 품목 분류 명칭이 포함되어 있습니다.");
        }


        for(CategoryListDto dto: categoryListDtoList){

            dto.setCreatedAt(LocalDateTime.now());
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
                            try {
                                startNum = Integer.parseInt(maxChildCls.substring(parentCls.length())) + 1;
                            } catch (NumberFormatException e) {
                                throw new IllegalStateException("카테고리 코드 형식이 올바르지 않습니다: " + maxChildCls);
                            }
                        }
                        maxChildClassMap.put(parentCls, startNum);
                    }
                    
                    // 2) 입력할 숫자 map에서 반환
                    int currentNum = maxChildClassMap.get(parentCls);

                    dto.setItemCls(parentCls.concat(String.valueOf(currentNum)));
                    filteredList.add(dto);

                    // 3) 숫자 제한 체크
                    if(currentNum > 9){
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

    // 수정
    @Transactional
    public void updateCategory(List<CategoryUpdateDto> updateDtoList, SessionUser loginUser){

        for(CategoryUpdateDto dto: updateDtoList){

            dto.setModifiedAt(LocalDateTime.now());
            dto.setModifiedBy(loginUser.getUserId());

            int result = categoryMapper.updateCategory(dto);

            if(result == 0){
                throw new NoSuchElementException("수정할 카테고리가 존재하지 않거나 이미 삭제되었습니다. (Code: " + dto.getItemCls() + ")");
            }
        }
    }
}
