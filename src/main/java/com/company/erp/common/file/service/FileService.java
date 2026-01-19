package com.company.erp.common.file.service;

import com.company.erp.common.docNum.service.DocKey;
import com.company.erp.common.docNum.service.DocNumService;
import com.company.erp.common.file.config.FileProperties;
import com.company.erp.common.file.dto.FileListItemResponse;
import com.company.erp.common.file.dto.FileUploadResponse;
import com.company.erp.common.file.exception.FileException;
import com.company.erp.common.file.infra.FileStorage;
import com.company.erp.common.file.infra.StoredFile;
import com.company.erp.common.file.mapper.AttFileMapper;
import com.company.erp.common.file.model.AttFileEntity;
import com.company.erp.common.file.util.FileNameUtils;
import com.company.erp.common.session.SessionUser;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FileService {

    private final FileProperties props;
    private final FileStorage fileStorage;
    private final AttFileMapper fileMapper;
    private final DocNumService docNumService;

    private static final DateTimeFormatter DIR_FMT = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    /**
     * - vendorCd는 "누가 볼 수 있나(공유 대상)"를 의미하므로 기능 서비스(PO/PR 등)에서 결정해서 전달
     * - 협력사(V)는 반드시 자기 vendorCd로만 업로드 가능
     * - 구매사(B)는 vendorCd를 null(내부용) 또는 특정 vendor(공유용)로 업로드 가능
     */
    @Transactional
    public FileUploadResponse upload(MultipartFile file, String refType, String refNo, String vendorCd, SessionUser ses) {
        // 기본 검증
        if (ses == null) throw new FileException("세션 정보가 없습니다.");
        if (file == null || file.isEmpty()) throw new FileException("업로드할 파일이 비어있습니다.");
        if (isBlank(refType) || isBlank(refNo)) throw new FileException("참조문서유형/참조문서번호는 필수입니다.");

        // 권한/대상 검증: 협력사는 vendorCd가 필수, 세션 vendorCd와 일치해야 함
        assertUploadVendor(ses, vendorCd);

        // 용량 체크
        long max = props.getMaxSizeBytes();
        if (max > 0 && file.getSize() > max) {
            throw new FileException("파일 용량이 너무 큽니다.");
        }

        // 확장자 체크
        String originName = file.getOriginalFilename();
        String ext = FileNameUtils.getExt(originName);
        if (props.getAllowedExt() != null && !props.getAllowedExt().isEmpty()) {
            boolean ok = props.getAllowedExt().stream()
                    .filter(x -> x != null && !x.isBlank())
                    .map(String::toLowerCase)
                    .anyMatch(x -> x.equals(ext));
            if (!ok) throw new FileException("허용되지 않은 파일 확장자입니다.");
        }

        // 저장 파일명(UUID.ext)
        String saveName = FileNameUtils.newSaveName(ext);

        // 상대 디렉토리: REF_TYPE/yyyy/MM/dd
        String relativeDir = buildRelativeDir(refType);

        // 디스크 저장
        StoredFile stored;
        try {
            stored = fileStorage.store(file, relativeDir, saveName);
        } catch (IOException e) {
            throw new FileException("파일 저장 중 오류가 발생했습니다.");
        } catch (SecurityException e) {
            throw new FileException("유효하지 않은 파일 경로입니다.");
        }

        // FILE_NUM 채번
        String fileNum = docNumService.generateDocNumStr(DocKey.FL);

        // DB insert
        AttFileEntity entity = new AttFileEntity();
        entity.setFileNum(fileNum);
        entity.setRefType(refType);
        entity.setRefNo(refNo);

        entity.setRegUserId(ses.getUserId());
        entity.setDelFlag("N");

        entity.setOriginName(originName);
        entity.setSaveName(saveName);

        // DB에는 상대경로 저장 (base-dir 제외)
        entity.setFilePath(stored.getRelativePath());

        entity.setFileSize(file.getSize());
        entity.setContentType(file.getContentType());

        // 공유대상인 vendorCd는 모듈의 서비스에서 결정한 값으로 저장
        // 구매사 내부용이면 null 가능(정책)
        // 협력사는 null 불가 + 세션 vendor와 일치 강제(assertUploadVendor에서 처리)
        entity.setVendorCd(isBlank(vendorCd) ? null : vendorCd);

        // 삭제에 사용할 절대경로
        String absolutePathForCompensation = stored.getAbsolutePath();
        try {
            int inserted = fileMapper.insert(entity);
            if (inserted != 1) throw new FileException("파일 메타데이터 저장에 실패했습니다.");
        } catch (RuntimeException ex) {
            try {
                fileStorage.delete(absolutePathForCompensation);
            } catch (Exception ignore) {
                // TODO logger.warn(...)
            }
            throw ex;
        }

        return new FileUploadResponse(fileNum, originName, file.getSize(), file.getContentType());
    }

    // 파일 정보 조회 (다운로드용 파일명, Content-Type 가져오기)
    @Transactional(readOnly = true)
    public AttFileEntity getFileInfo(String fileNum, SessionUser ses) {
        if (ses == null) throw new FileException("세션 정보가 없습니다.");
        if (isBlank(fileNum)) throw new FileException("파일번호는 필수입니다.");

        AttFileEntity file = fileMapper.findByFileNum(fileNum);
        if (file == null) throw new FileException("파일을 찾을 수 없습니다.");
        if ("Y".equalsIgnoreCase(file.getDelFlag())) throw new FileException("삭제된 파일입니다.");

        // 조회 권한 검증: V는 vendorCd 일치만 허용 / B는 전체 허용
        assertVendorAccess(file, ses);

        return file;
    }

    // 다운로드
    @Transactional(readOnly = true)
    public Resource download(String fileNum, SessionUser ses) {
        if (ses == null) throw new FileException("세션 정보가 없습니다.");
        if (isBlank(fileNum)) throw new FileException("파일번호는 필수입니다.");

        AttFileEntity file = fileMapper.findByFileNum(fileNum);
        if (file == null) throw new FileException("파일을 찾을 수 없습니다.");
        if ("Y".equalsIgnoreCase(file.getDelFlag())) throw new FileException("삭제된 파일입니다.");

        // 조회 권한 검증: V는 vendorCd 일치만 허용 / B는 전체 허용
        assertVendorAccess(file, ses);

        String absolutePath = Paths.get(props.getBaseDir(), file.getFilePath()).toString();
        try {
            return fileStorage.loadAsResource(absolutePath);
        } catch (SecurityException e) {
            throw new FileException("유효하지 않은 파일 접근입니다.");
        }
    }

    // 문서별 첨부 목록 조회
    @Transactional(readOnly = true)
    public List<FileListItemResponse> list(String refType, String refNo, SessionUser ses) {
        if (ses == null) throw new FileException("세션 정보가 없습니다.");
        if (isBlank(refType) || isBlank(refNo)) throw new FileException("참조문서유형/참조문서번호는 필수입니다.");

        List<AttFileEntity> list = fileMapper.findByRef(refType, refNo);

        // 협력사는 자기 협력사의 파일만 노출, 구매사는 전체
        return list.stream()
                .filter(f -> canView(f, ses, refType))
                .map(f -> new FileListItemResponse(
                        f.getFileNum(),
                        f.getOriginName(),
                        f.getFileSize() == null ? 0L : f.getFileSize(),
                        f.getContentType(),
                        f.getRegDate(),
                        f.getRegUserId()
                ))
                .toList();
    }

    // 논리 삭제
    @Transactional
    public void delete(String fileNum, SessionUser ses) {
        if (ses == null) throw new FileException("세션 정보가 없습니다.");
        if (isBlank(fileNum)) throw new FileException("파일번호는 필수입니다.");

        AttFileEntity file = fileMapper.findByFileNum(fileNum);
        if (file == null) throw new FileException("파일을 찾을 수 없습니다.");
        if ("Y".equalsIgnoreCase(file.getDelFlag())) throw new FileException("이미 삭제된 파일입니다.");

        // 삭제 권한: 협력사는 vendor_cd 일치만 / 구매사는 전체
        assertVendorAccess(file, ses);

        int updated = fileMapper.markDeleted(fileNum, ses.getUserId());
        if (updated == 0) throw new FileException("파일 삭제 처리에 실패했습니다.");
    }

    private String buildRelativeDir(String refType) {
        String date = LocalDate.now().format(DIR_FMT);
        return refType + "/" + date;
    }

    /*
     *  협력사(V): vendorCd 필수 + 세션 vendorCd와 동일해야 함 -> 협력사는 자신의 협력사 문서만 업로드/조회
     *  구매사(B): vendorCd는 null(내부용) 또는 특정 vendor(공유용) 허용 -> 구매사는 전부 or 보여줄 협력사만 업로드/조회
     */
    private void assertUploadVendor(SessionUser ses, String vendorCd) {
        if (!"V".equalsIgnoreCase(ses.getComType())) return; // 구매사는 정책상 허용

        String myVendor = ses.getVendorCd();
        if (isBlank(myVendor)) throw new FileException("협력사 권한 정보가 없습니다.");

        if (isBlank(vendorCd)) throw new FileException("협력사는 vendorCd가 필수입니다.");
        if (!myVendor.equals(vendorCd)) throw new FileException("업로드 권한이 없습니다.");
    }

    private void assertVendorAccess(AttFileEntity file, SessionUser ses) {
        // 구매사(B)는 전체 허용
        if (!"V".equalsIgnoreCase(ses.getComType())) return;

        // 공지사항(NOTICE)은 모든 협력사가 접근 가능
        if ("NOTICE".equalsIgnoreCase(file.getRefType())) return;

        String myVendor = ses.getVendorCd();
        String fileVendor = file.getVendorCd();

        if (isBlank(myVendor)) throw new FileException("협력사 권한 정보가 없습니다.");
        if (isBlank(fileVendor) || !myVendor.equals(fileVendor)) {
            throw new FileException("해당 파일에 접근 권한이 없습니다.");
        }
    }

    private boolean canView(AttFileEntity file, SessionUser ses, String refType) {
        // 구매사는 전체 파일 조회 가능
        if (!"V".equalsIgnoreCase(ses.getComType())) return true;
        
        // 공지사항(NOTICE)은 모든 협력사가 볼 수 있음 (구매사가 업로드한 파일 포함)
        if ("NOTICE".equalsIgnoreCase(refType)) return true;
        
        // 그 외 문서는 협력사는 자신의 vendorCd와 일치하는 파일만 조회 가능
        String myVendor = ses.getVendorCd();
        return !isBlank(myVendor) && myVendor.equals(file.getVendorCd());
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
