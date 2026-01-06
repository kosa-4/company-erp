package com.company.erp.common.docNum.mapper;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDate;

public interface DocNumMapper {
    // doc_type + doc_date 기준으로 seq 증가
    int increaseSeq(@Param("docType") String docType,
                    @Param("docDate") LocalDate docDate);

    // 바로 직전에 증가된 seq 값 조회
    int selectCurrentSeq();
}