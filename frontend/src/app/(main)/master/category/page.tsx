'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui';
import CategoryTable from './CategoryTable';
import { Category } from '../item/TreeItem';

interface InputCategory {
    itemCls: string,
    itemClsNm: string,
    useFlag: boolean,
    itemLvl: number,
    parentItemCls: any,
}

export default function CategoryPage() {
    // 1. 상태 관리: 데이터와 선택된 ID를 분리합니다.
    const [cateMap, setCateMap] = useState<{ [key: string]: Category }>({}); // 전체 데이터 맵
    const [rootList, setRootList] = useState<Category[]>([]); // 최상위(1열) 목록

    // ★ 핵심: 단계별로 선택된 ID를 따로 관리합니다.
    const [selectedMainId, setSelectedMainId] = useState(""); // 1열 선택값
    const [selectedSubId, setSelectedSubId] = useState("");   // 2열 선택값

    const [inputDatas, setInputDatas] = useState<InputCategory[]>([]);

    // 2. 데이터 조회 및 트리 변환
    const fetchCategories = async () => {
        try {
            // 캐시 방지를 위해 timestamp 추가
            const response = await fetch("/api/v1/categories/all");
            if (!response.ok) throw new Error("서버 응답 오류");

            const rawData = await response.text();
            if(!rawData) return;
            
            const data = JSON.parse(rawData);

            // 트리 만들기 (기존 로직 유지하되 지역변수 사용)
            const tempMap: { [key: string]: Category } = {};
            const tempRoot: Category[] = [];

            // 1. 맵 등록
            data.forEach((c: any) => {
                tempMap[c.itemCls] = { ...c, children: [] };
            });

            // 2. 연결
            data.forEach((c: any) => {
                const pId = c.parentItemCls;
                if (pId && tempMap[pId]) {
                    tempMap[pId].children?.push(tempMap[c.itemCls]);
                } else {
                    tempRoot.push(tempMap[c.itemCls]);
                }
            });

            // 3. State 업데이트 (한방에 렌더링)
            setCateMap(tempMap);
            setRootList(tempRoot);
            
            // 입력창 초기화
            setInputDatas([]);

        } catch (err) {
            console.error("데이터 로딩 중 오류 발생", err);
            // alert("데이터 로드 실패");
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // 3. 파생 데이터 계산 (선택된 ID에 따라 자식 목록 자동 계산)
    
    // 2열 데이터 (1열에서 선택된 놈의 자식들)
    const class1List = useMemo(() => {
        return selectedMainId && cateMap[selectedMainId] 
            ? cateMap[selectedMainId].children || [] 
            : [];
    }, [selectedMainId, cateMap]);

    // 3열 데이터 (2열에서 선택된 놈의 자식들)
    const class2List = useMemo(() => {
        return selectedSubId && cateMap[selectedSubId] 
            ? cateMap[selectedSubId].children || [] 
            : [];
    }, [selectedSubId, cateMap]);


    // 4. 이벤트 핸들러

    // 행 클릭 핸들러 (어느 열을 클릭했냐에 따라 다르게 동작)
    const handleRowClick = (e: any, level: number) => {
        const id = e.target.value; // CategoryTable에서 value에 ID를 담아 보냄
        
        if (level === 0) {
            // 1열 클릭 -> 2열 갱신, 3열 초기화
            setSelectedMainId(id);
            setSelectedSubId(""); 
        } else if (level === 1) {
            // 2열 클릭 -> 3열 갱신 (1열은 그대로 유지됨!)
            setSelectedSubId(id);
        }
        // 3열 클릭은 별도 로직이 필요하면 여기에 추가
    };

    // 행 추가
    const handleAddRow = (e: any, itemLvl: number, targetParentId: string) => {
        const initCode = itemLvl === 0 ? "" : targetParentId;
        const newInput = {
            itemCls: initCode,
            itemClsNm: '',
            useFlag: true,
            itemLvl: itemLvl,
            parentItemCls: targetParentId === "" ? null : targetParentId,
        };
        setInputDatas([...inputDatas, newInput]);
    };

    // 입력값 변경
    const handleInputChange = (index: number, field: keyof Category, value: any) => {
        const updatedInput = inputDatas.map((data, i) =>
            i === index ? { ...data, [field]: value } : data
        );
        setInputDatas(updatedInput);
    };

    // 저장
    const saveCategory = async (targetParentId: string) => {
        // 해당 부모 밑에 있는 입력값만 필터링해서 저장
        const currentParent = targetParentId === "" ? null : targetParentId;
        
        const dataToSave = inputDatas.filter(d => 
            d.parentItemCls === currentParent && 
            d.itemCls.trim() !== '' && d.itemClsNm.trim() !== ''
        );

        if (dataToSave.length === 0) {
            alert("저장할 데이터를 입력해주세요");
            return;
        }

        try {
            const response = await fetch("/api/v1/categories/new", {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(dataToSave),
            });

            if (!response.ok) throw new Error(`입력 실패 ${response.status}`);

            alert("저장되었습니다.");
            await fetchCategories(); // 데이터 갱신

        } catch (err) {
            console.error("저장 오류", err);
        }
    };

    // 삭제
    const handleDeleteCategory = async (itemCls: any) => {
        if(!confirm("삭제하시겠습니까?")) return;
        try {
            const response = await fetch(`/api/v1/categories/${itemCls}`, { method: "DELETE" });
            if (!response.ok) throw new Error(await response.text());
            
            await fetchCategories();
            alert("삭제되었습니다.");
            
            // 삭제된 항목이 선택되어 있었다면 선택 해제
            if(selectedMainId === itemCls) setSelectedMainId("");
            if(selectedSubId === itemCls) setSelectedSubId("");

        } catch (err: any) {
            alert(err.message);
        }
    }
    
    // 체크박스 핸들러 (필요시 구현)
    const handleSelectedCheck = (e:any) => {};


    return (
        <div>
            <PageHeader
                title="품목 현황"
                subtitle="품목 정보를 조회하고 관리합니다."
                icon={
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                }
            />
            <div className="p-4 bg-gray-100 min-h-screen text-sm">

                {/* 메인 3단 그리드 */}
                <div className="grid grid-cols-3 gap-2 h-[600px]">

                    {/* 1열: 품목 종류 (Root) */}
                    <CategoryTable
                        title="품목 종류"
                        itemType="MAIN"
                        itemLvl={0}
                        maxLength={2}
                        
                        categories={rootList} // 전체 목록
                        inputDatas={inputDatas.filter(d => d.itemLvl === 0)} // 해당 레벨 입력창만
                        
                        // 선택 상태 (하이라이트용)
                        itemCls={selectedMainId} 
                        parentCls="" // Root는 부모 없음

                        // 이벤트 연결
                        handleChildItemType={(e: any) => handleRowClick(e, 0)} // 레벨 0 클릭
                        fetchCategories={fetchCategories}
                        handleInputChange={handleInputChange}
                        handleAddRow={handleAddRow}
                        saveCategory={() => saveCategory("")}
                        handleDeleteCategory={handleDeleteCategory}
                        handleSelectedCheck={handleSelectedCheck}
                        
                        // 필수 prop 채우기
                        childItemType="CLASS1"
                        isChecked={false}
                    />

                    {/* 2열: 대분류 (1열 선택 시 표시) */}
                    <CategoryTable
                        title="대분류"
                        itemType="CLASS1"
                        itemLvl={1}
                        maxLength={1}

                        categories={class1List} // 계산된 자식 목록
                        inputDatas={inputDatas.filter(d => d.parentItemCls === selectedMainId)}

                        // 선택 상태
                        itemCls={selectedSubId}
                        parentCls={selectedMainId} // 부모는 1열 선택값

                        // 이벤트 연결
                        handleChildItemType={(e: any) => handleRowClick(e, 1)} // 레벨 1 클릭
                        fetchCategories={fetchCategories}
                        handleInputChange={handleInputChange}
                        handleAddRow={handleAddRow}
                        saveCategory={() => saveCategory(selectedMainId)}
                        handleDeleteCategory={handleDeleteCategory}
                        handleSelectedCheck={handleSelectedCheck}
                        isChecked={false}
                        childItemType="CLASS2"

                    />

                    {/* 3열: 중분류 (체크박스 모드) */}
                    <CategoryTable
                        title="중분류" // 제목 변경
                        itemType="CLASS2"
                        itemLvl={2}
                        maxLength={1}

                        categories={class2List} // 계산된 손자 목록
                        inputDatas={inputDatas.filter(d => d.parentItemCls === selectedSubId)}

                        // 선택 상태
                        itemCls="" 
                        parentCls={selectedSubId} // 부모는 2열 선택값

                        // 이벤트
                        handleChildItemType={(e: any) => { /* 체크박스 로직 필요시 작성 */ }}
                        fetchCategories={fetchCategories}
                        handleInputChange={handleInputChange}
                        handleAddRow={handleAddRow}
                        saveCategory={() => saveCategory(selectedSubId)}
                        handleDeleteCategory={handleDeleteCategory}
                        handleSelectedCheck={handleSelectedCheck}

                        childItemType="CLASS3"
                        isChecked={false}

                    />
                    {/* 3열: 중분류 (체크박스 모드) */}
                    <CategoryTable
                        title="소분류" 
                        itemType="CLASS2"
                        itemLvl={2}
                        maxLength={1}

                        categories={class2List} // 계산된 손자 목록
                        inputDatas={inputDatas.filter(d => d.parentItemCls === selectedSubId)}

                        // 선택 상태
                        itemCls="" 
                        parentCls={selectedSubId} // 부모는 2열 선택값

                        // 이벤트
                        handleChildItemType={(e: any) => { /* 체크박스 로직 필요시 작성 */ }}
                        fetchCategories={fetchCategories}
                        handleInputChange={handleInputChange}
                        handleAddRow={handleAddRow}
                        saveCategory={() => saveCategory(selectedSubId)}
                        handleDeleteCategory={handleDeleteCategory}
                        handleSelectedCheck={handleSelectedCheck}

                        childItemType="CLASS3"
                        isChecked={false}
                        

                    />

                </div>
            </div>
        </div>
    );
}