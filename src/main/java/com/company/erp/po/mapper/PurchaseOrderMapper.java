package com.company.erp.po.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.company.erp.po.dto.PurchaseOrderDTO;
import com.company.erp.po.dto.PurchaseOrderItemDTO;

@Mapper
public interface PurchaseOrderMapper {
    
    List<PurchaseOrderDTO> selectList(Map<String, Object> params);

    PurchaseOrderDTO selectHeader(String poNo);

    List<PurchaseOrderItemDTO> selectItems(String poNo);
    
    // 등록 시 regUserId 별도 전달 (DTO에 포함되지 않음)
    int insertHeader(@Param("dto") PurchaseOrderDTO dto,
                     @Param("regUserId") String regUserId);
    
    // 등록 시 regUserId 별도 전달
    int insertItem(@Param("item") PurchaseOrderItemDTO item,
                   @Param("regUserId") String regUserId);
    
    // 수정 시 modUserId 별도 전달 (DTO에 포함되지 않음)
    int updateHeader(@Param("dto") PurchaseOrderDTO dto,
                     @Param("modUserId") String modUserId);
    
    int deleteHeader(String poNo);
    
    int deleteItems(String poNo);
    
    int updateStatus(@Param("poNo") String poNo,
                     @Param("status") String status,
                     @Param("userId") String userId);
}
