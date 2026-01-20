package com.company.erp.master.item.service;

import com.company.erp.common.docNum.dto.DocNumDTO;
import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.common.session.SessionUser;
import com.company.erp.master.item.dto.*;
import com.company.erp.master.item.mapper.ItemMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class ItemService {
    @Autowired
    ItemMapper itemMapper;
    @Autowired
    DocNumService docNumService;

    /* 조회 */
    public ItemResponseDto<ItemDetailDto> getItemList(ItemSearchDto searchDto) {
        // 1. 총 품목 수 계산
        int totalCount = itemMapper.countItemList(searchDto);
        // 2. 총 페이지 계산
        int totalPage = (int)Math.ceil((double) totalCount / searchDto.getPageSize());
        // 3. Dto 반환
        return new ItemResponseDto<ItemDetailDto>(
                itemMapper.selectItemList(searchDto),
                searchDto.getPage(),
                searchDto.getPageSize(),
                totalPage,
                totalCount
        );
    }

    /* 상세 품목 조회 */
    public ItemDetailDto getItemDetail(String code) {
        return itemMapper.selectItemByCode(code);
    }

    /* 저장 */
    @Transactional
    public void registerItem(ItemDetailDto itemDetailDto, SessionUser loginUser) {
        // 1. 중복 체크
        boolean existsItem = itemMapper.existsByNameAndSpec(itemDetailDto);
        if(existsItem){
            throw new IllegalStateException("동일한 이름과 규격의 품목이 존재합니다.");
        }

        // 2. 중복 아닐 시
        // 2-1. 체번 계산
        String itemCode = docNumService.generateDocNumStr(DocKey.IT);
        itemDetailDto.setItemCode(itemCode);
        // 2-2. 값 입력
        itemDetailDto.setStatus("A");
        itemDetailDto.setCreatedAt(LocalDateTime.now());
        itemDetailDto.setCreatedBy(loginUser.getUserId());

        // 2-3. 품목 마스터 등록
        itemMapper.insertItemMTGL(itemDetailDto);
        // 2-4. 품목 카테고리 등록
//        itemMapper.insertItemMTGC(itemDetailDto);
    }

    /* 수정 */
    @Transactional
    public void updateItem(ItemDetailDto itemDetailDto) {
        // 품목 존재 여부 확인
        ItemDetailDto item = itemMapper.selectItemByCode(itemDetailDto.getItemCode());
        if(item == null){
            throw new IllegalStateException("존재하지 않는 품목입니다.");
        }
        
        // 상태 확인
        String status =  item.getStatus();
        if("A".equals(status)){
            throw new IllegalStateException("승인 완료된 품목으로 수정이 불가합니다.");
        }
        
        // 업데이트
        itemMapper.updateItem(itemDetailDto);
    }
}
