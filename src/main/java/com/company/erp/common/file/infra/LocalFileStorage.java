package com.company.erp.common.file.infra;

import com.company.erp.common.file.config.FileProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;

@Component
@RequiredArgsConstructor
public class LocalFileStorage implements FileStorage {

    private final FileProperties props;

    @Override
    public StoredFile store(MultipartFile file, String relativeDir, String saveName) throws IOException {
        // properties에 설정한 base-dir
        Path base = Paths.get(props.getBaseDir()).normalize().toAbsolutePath();

        // ../ 같은 경로 침투 공격 방지
        String safeRelativeDir = relativeDir == null ? "" : relativeDir.replace("\\", "/");
        // base-dir + 상대경로
        Path dir = base.resolve(safeRelativeDir).normalize();
        if (!dir.startsWith(base)) {
            throw new SecurityException("유효하지 않은 파일 경로입니다.");
        }

        // 디렉토리 없으면 생성
        Files.createDirectories(dir);

        // 최종 파일 경로
        Path target = dir.resolve(saveName).normalize();

        // 파일명 조작 방지
        if (!target.startsWith(dir)) {
            throw new SecurityException("유효하지 않은 파일 이름입니다.");
        }

        // 실제 파일 저장
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }

        // 파일 크기
        long size = Files.size(target);

        // DB 저장용 상대경로 생성
        String relativePath = base.relativize(target).toString().replace("\\", "/");

        // 저장 결과 반환
        return new StoredFile(target.toString(), relativePath, size);
    }

    @Override
    public Resource loadAsResource(String absolutePath) {
        if (props.getBaseDir() == null || props.getBaseDir().isBlank()) {
            throw new IllegalStateException("파일 저장 경로(app.file.base-dir)가 설정되어 있지 않습니다.");
        }

        Path base = Paths.get(props.getBaseDir()).normalize().toAbsolutePath();
        Path p = Paths.get(absolutePath).normalize().toAbsolutePath();

        // base-dir 밖 파일은 열지 않도록 차단
        if (!p.startsWith(base)) {
            throw new SecurityException("유효하지 않은 파일 접근입니다.");
        }

        return new FileSystemResource(p.toFile());
    }
}
