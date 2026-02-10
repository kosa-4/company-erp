package com.company.erp.inventory;

import com.company.erp.inventory.dto.GoodsReceiptDTO;
import com.company.erp.inventory.dto.GoodsReceiptItemDTO;
import com.company.erp.inventory.service.GoodsReceiptService;
import com.company.erp.po.mapper.PurchaseOrderMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
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
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@SpringBootTest
class GoodsReceiptConcurrencyTest {

    private static final Logger log = LoggerFactory.getLogger(GoodsReceiptConcurrencyTest.class);
    private static ExtentReports extent;
    private static ExtentTest mainTest;

    @BeforeAll
    static void setupReport() {
        // 기존 리포트 파일에 이어서 작성하거나 덮어씌웁니다.
        ExtentSparkReporter spark = new ExtentSparkReporter("TEST_DASHBOARD.html");
        spark.config().setTheme(Theme.DARK);
        spark.config().setDocumentTitle("ERP Concurrency Control Report");
        spark.config().setReportName("비관적 락(Pessimistic Lock) 테스트 리포트");

        extent = new ExtentReports();
        extent.attachReporter(spark);
        mainTest = extent.createTest("비관적 락 동시성 테스트", "여러 사용자가 동시에 같은 발주건에 대해 입고를 진행하는 시나리오");
    }

    @AfterAll
    static void tearDownReport() {
        if (extent != null) {
            extent.flush();
        }
        log.info("✅ 대시보드 리포트가 생성/업데이트 되었습니다: TEST_DASHBOARD.html");
    }

    @Autowired
    private GoodsReceiptService goodsReceiptService;

    @Test
    @DisplayName("비관적 락: 동시 입고 처리 시 수량 누락이 없어야 한다")
    void pessimisticLockTest() throws InterruptedException {
        String poNo = "PO2601260011";
        String itemCode = "IT-2026-000045";
        
        mainTest.log(Status.INFO, "테스트 대상 발주번호: " + poNo);
        mainTest.log(Status.INFO, "테스트 대상 품목코드: " + itemCode);

        int numberOfThreads = 3;
        ExecutorService executorService = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch latch = new CountDownLatch(numberOfThreads);
        
        AtomicInteger successCount = new AtomicInteger();
        AtomicInteger failCount = new AtomicInteger();

        // When: 동시에 3명이 각각 10개씩 입고 시도
        for (int i = 0; i < numberOfThreads; i++) {
            final int index = i + 1;
            executorService.submit(() -> {
                // 스레드별 가짜 요청 컨텍스트 설정 (세션 에러 방지)
                RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(new MockHttpServletRequest()));
                
                ExtentTest node = mainTest.createNode("사용자 " + index + " 입고 시도");
                try {
                    node.log(Status.INFO, "입고 생성 시작 (수량: 10)");
                    
                    GoodsReceiptDTO grDto = new GoodsReceiptDTO();
                    grDto.setPoNo(poNo);
                    
                    List<GoodsReceiptItemDTO> items = new ArrayList<>();
                    GoodsReceiptItemDTO item = new GoodsReceiptItemDTO();
                    item.setItemCode(itemCode);
                    item.setGrQuantity(new BigDecimal("10"));
                    item.setGrAmount(new BigDecimal("500000")); // 단가 50,000 * 10
                    item.setWarehouseCode("WH01");
                    items.add(item);
                    
                    grDto.setItems(items);

                    goodsReceiptService.create(grDto);
                    
                    successCount.incrementAndGet();
                    node.log(Status.PASS, "사용자 " + index + ": 입고 처리 완료 (DB Commit 완료)");
                } catch (Exception e) {
                    failCount.incrementAndGet();
                    node.log(Status.FAIL, "사용자 " + index + ": 입고 실패");
                    node.log(Status.FAIL, "에러 내용: " + e.getMessage());
                } finally {
                    // 컨텍스트 정리
                    RequestContextHolder.resetRequestAttributes();
                    latch.countDown();
                }
            });
        }

        latch.await();
        executorService.shutdown();

        // Then
        mainTest.log(Status.INFO, "최종 결과 - 성공: " + successCount.get() + ", 실패: " + failCount.get());

        if (successCount.get() == numberOfThreads) {
            mainTest.log(Status.PASS, "검증 완료: 모든 요청이 비관적 락에 의해 순차적으로 정상 처리됨.");
        } else {
            mainTest.log(Status.FAIL, "검증 실패: 일부 요청이 누락되거나 실패함.");
        }

        assertEquals(numberOfThreads, successCount.get());
    }
}
