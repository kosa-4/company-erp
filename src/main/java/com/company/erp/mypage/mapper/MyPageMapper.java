package com.company.erp.mypage.mapper;

import com.company.erp.mypage.dto.MyInfoDTO;
import com.company.erp.mypage.dto.MyInfoUpdateDTO;
import org.apache.ibatis.annotations.Param;

public interface MyPageMapper {

    MyInfoDTO selectMyInfo(
            @Param("userId") String userId,
            @Param("userNameKo") String userNameKo,
            @Param("userType") String userType,
            @Param("role") String role,
            @Param("deptCd") String deptCd,
            @Param("deptName") String deptName
    );
    
    int updateMyInfo(MyInfoUpdateDTO dto);
}
