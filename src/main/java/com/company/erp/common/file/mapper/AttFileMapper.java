package com.company.erp.common.file.mapper;

import com.company.erp.common.file.model.AttFileEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AttFileMapper {

    // 파일 메타 저장
    int insert(AttFileEntity entity);

    // 파일 단건 조회 (다운로드용)
    AttFileEntity findByFileNum(@Param("fileNum") String fileNum);

    // 문서별 첨부파일 목록
    List<AttFileEntity> findByRef(@Param("refType") String refType,
                                  @Param("refNo") String refNo);

    // 논리 삭제
    int markDeleted(@Param("fileNum") String fileNum,
                    @Param("modUserId") String modUserId);
}
