package com.company.erp.master.item;

import com.company.erp.common.session.SessionUser;
import com.company.erp.master.item.dto.ItemDetailDto;
import com.company.erp.master.item.mapper.ItemMapper;
import com.company.erp.master.item.service.ItemService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
import com.aventstack.extentreports.reporter.ExtentSparkReporter;
import com.aventstack.extentreports.reporter.configuration.Theme;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;

@SpringBootTest
class ItemConcurrencyTest {

    private static final Logger log = LoggerFactory.getLogger(ItemConcurrencyTest.class);
    private static ExtentReports extent;
    private static ExtentTest mainTest;

    @BeforeAll
    static void setupReport() {
        ExtentSparkReporter spark = new ExtentSparkReporter("TEST_DASHBOARD.html");
        spark.config().setTheme(Theme.DARK);
        spark.config().setDocumentTitle("ERP Concurrency Control Report");
        spark.config().setReportName("낙관적 락(Optimistic Lock) 테스트 리포트");

        extent = new ExtentReports();
        extent.attachReporter(spark);
        mainTest = extent.createTest("낙관적 락 동시성 테스트", "두 사용자가 동시에 같은 품목을 수정하는 시나리오");
    }

    @AfterAll
    static void tearDownReport() {
        if (extent != null) {
            extent.flush();
        }
        log.info("✅ 대시보드 리포트가 생성되었습니다: TEST_DASHBOARD.html");
    }

    @Autowired
    private ItemService itemService;

    @Autowired
    private ItemMapper itemMapper;

    @Test
    @DisplayName("낙관적 락: 동시 수정 시 시나리오 모니터링")
    void optimisticLockTest() throws InterruptedException {
        String itemCode = "IT-2026-000043";

        mainTest.log(Status.INFO, "테스트 대상 품목: " + itemCode);

        int numberOfThreads = 2;
        ExecutorService executorService = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch latch = new CountDownLatch(numberOfThreads);

        AtomicInteger successCount = new AtomicInteger();
        AtomicInteger failCount = new AtomicInteger();

        ItemDetailDto dto1 = itemMapper.selectItemByCode(itemCode);
        ItemDetailDto dto2 = itemMapper.selectItemByCode(itemCode);

        mainTest.log(Status.INFO, "초기 데이터 로드 완료 (Version: " + dto1.getVersion() + ")");

        SessionUser userA = new SessionUser("userA", "127.0.0.1", "B", null, "관리자A", "PUR01", "구매팀", "BUYER");
        SessionUser userB = new SessionUser("userB", "127.0.0.1", "B", null, "관리자B", "PUR01", "구매팀", "BUYER");

        executorService.submit(() -> {
            ExtentTest node = mainTest.createNode("사용자 A 수정 시도");
            try {
                node.log(Status.INFO, "관리자A: '이름 수정 AA' 시도");
                dto1.setItemName("이름 수정 AA");
                itemService.updateItem(dto1, userA);
                successCount.incrementAndGet();
                node.log(Status.PASS, "관리자A: 수정 및 커밋 성공");
            } catch (Exception e) {
                failCount.incrementAndGet();
                node.log(Status.FAIL, "관리자A: 충돌 감지 (Exception: " + e.getClass().getSimpleName() + ")");
                node.log(Status.WARNING, "에러 메시지: " + e.getMessage());
            } finally {
                latch.countDown();
            }
        });

        executorService.submit(() -> {
            ExtentTest node = mainTest.createNode("사용자 B 수정 시도");
            try {
                node.log(Status.INFO, "관리자B: '이름 수정 BB' 시도");
                dto2.setItemName("이름 수정 BB");
                itemService.updateItem(dto2, userB);
                successCount.incrementAndGet();
                node.log(Status.PASS, "관리자B: 수정 및 커밋 성공");
            } catch (Exception e) {
                failCount.incrementAndGet();
                node.log(Status.FAIL, "관리자B: 충돌 감지 (Exception: " + e.getClass().getSimpleName() + ")");
                node.log(Status.WARNING, "에러 메시지: " + e.getMessage());
            } finally {
                latch.countDown();
            }
        });

        latch.await();

        mainTest.log(Status.INFO, "최종 결과 - 성공: " + successCount.get() + ", 실패: " + failCount.get());

        if (successCount.get() == 1 && failCount.get() == 1) {
            mainTest.log(Status.PASS, "검증 완료: 낙관적 락이 정상적으로 작동하여 정합성이 유지됨.");
        } else {
            mainTest.log(Status.FAIL, "검증 실패: 예상치 못한 결과 발생.");
        }

        assertEquals(1, successCount.get());
        assertEquals(1, failCount.get());
    }
}
