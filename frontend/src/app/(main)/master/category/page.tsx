'use client'

import React, {useState, useEffect} from 'react';

import { PageHeader } from '@/components/ui';
import CategoryTable from './CategoryTable';

interface Category {
    itemCls: string,
    itemClsNm: string,
    useFlag: boolean,
    itemLvl:number,
    parentItemCls:any,
}

export default function CategoryPage() {
    
    const [categories, setCategories] = useState<Category[]>([]);
    
    const [parentCls, setParentCls] = useState("");
    const [selectedType, setSelectedType] = useState("MAIN");

    // 1. 카테고리 조회
    const fetchCategories = async (parentCls: string) => {
        try{
            // 1. 데이터 요청 
            // 선택한 부모 카테고리의 하위 카테고리 반환
            // parentCls가 null일 시 품목 종류 카테고리 반환
            const param = {"parentItemCls": parentCls}
            const response = await fetch("/api/v1/categories?" +
                new URLSearchParams(param)
            );
            
            // 응답 실패 시
            if (!response.ok){
                throw new Error(`조회 실패 ${response.status}`);
            }

            // 2. 응답 값 저장
            const data = await response.json();
            // console.log("data ", data)
            setCategories(data);
        } catch(error){
            console.error("데이터 로드 중 오류 발생", error);
            alert("데이터 로드에 실패하였습니다.")
        }
    }

    
    
    // 품목 종류에서 선택된 부모 카테고리
    const [selectedMain, setSelectedMain] = useState<Category>();
    // 대분류에서 선택된 부모 카테고리
    const [selectedClass1, setSelectedClass1] = useState<Category>();
    // 중분류에서 선택된 부모 카테고리
    const [selectedClass2, setSelectedClass2] = useState<Category>();

    // const [itemCls, setItemCls] = useState("");
    // 2. 단일 카테고리 조회 (선택된 부모 카테고리 호출)
    const fetchCategoryByName = async () => {
        try{
            
            // 1. 파라미터 전달 (선택된 부모 카테고리)
            const response = await fetch(`/api/v1/categories/${parentCls}`)
            
            // 1-1. 네트워크 오류 체크
            if(!response.ok) throw new Error("서버 응답 오류");

            const data = await response.json();
            
            // 2. 선택된 카테고리에 따라 다른 값 입력
            switch(selectedType){
                case "CLASS1":
                    setSelectedMain(data);
                case "CLASS2":
                    setSelectedClass1(data);
                case "CLASS3":
                    setSelectedClass2(data);
                default:
                    
            }
            
        } catch(err){
            console.error("데이터 로딩 중 오류 발생", err)
            alert("데이터 로드에 실패했습니다.")
        }
    };

    // 3. 행 추가
    const [inputDatas, setInputDatas] = useState<Category[]>([])
    
    // 3-1. input 생성
    const handleAddRow = (e:any, itemLvl:number, parentCls:string) =>{        
        setSelectedType(e.target.value);
        setParentCls(parentCls)

        // 초기값 세팅
        const newInput = {
            itemCls: '',
            itemClsNm:'',
            useFlag: true,
            itemLvl: itemLvl,
            parentItemCls: parentCls === "" ? null : parentCls,
        };

        // null인 경우 처리
        if (!Array.isArray(inputDatas)) {
            setInputDatas([newInput]);
            return;
        }

        // 입력값 최신화
        setInputDatas([...inputDatas, newInput]);
        
    }  

    // 4. 변경 사항 저장
    const handleInputChange = (index: number, field: keyof Category, value:any) => {
        // 4-1. 해당 열과 같은 인덱스를 가진 곳에 변경된 input값 저장
        const updatedInput = inputDatas.map((data, i) => 
            i === index ? {...data, [field]: value} : data
        );

        // 4-2. 변경된 input 값 업데이트
        setInputDatas(updatedInput);
    }

    // 5. 카테고리 저장
    const saveCategory = async (parentCls: string) => {

        // 5-1. 입력 여부 확인
        const data = inputDatas.filter(d => d.itemCls.trim() !== '' && d.itemClsNm.trim() !== '');
        
        if(data.length === 0){
            alert("저장할 데이터를 입력해주세요");
            return;
        }
        try{
            // 5-2.. 데이터 요청
            const response = await fetch ("/api/v1/categories/new", {
                method: 'POST',
                headers:{
                    'Content-type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            
            if(!response.ok){
                throw new Error(`입력 실패 ${response.status}`)
            };

            alert("저장되었습니다.");
            // 5-3.input 초기화
            setInputDatas([]);
            // 5-4. 카테고리 출력
            fetchCategories(parentCls);
        } catch(err){
            console.error("데이터 입력 중 오류 발생", err);
        }
    };
    
    // 5. 체크 리스트 제어

    const [isChecked, setIsChecked] = useState(false);
    
    const handleChildItemType = (e: any, type:any) => {        

        const {value, checked} = e.target;

        // 1. 체크 해제 시
        if(!checked){
            setIsChecked(false);
            setSelectedType("MAIN");
        }

        // 2. 체크 시
        setIsChecked(true);
        setParentCls(value);
        setSelectedType(type);

        // 3. 자식 리스트 출력
        fetchCategories(value);

        // 4. 입력창 초기화
        setInputDatas([]);         
    }

    const handleSelectedCheck = (e:any) => {
        const {checked} = e.target;
        if(!checked){
            setIsChecked(false);
            setSelectedType("MAIN");
        }
        setIsChecked(true);
        
    }
    
    useEffect(() => {
        fetchCategories("");
    },[])

    useEffect(() => {
        fetchCategoryByName();
    },[selectedType])

    

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

            {/* 메인 3단 테이블 섹션 */}
            <div className="grid grid-cols-3 gap-2 h-[600px]">
                
                {/* 1. 품목 종류 테이블 */}
                
                <CategoryTable 
                // 테이블 기본 정보 전달
                title="품목 종류"   
                itemType="MAIN"
                childItemType="CLASS1"
                parentCls={parentCls}
                itemLvl={0}
                maxLength={2}

                // input 함수 전달
                fetchCategories={fetchCategories}
                handleInputChange={handleInputChange}
                handleChildItemType={(selectedType === "MAIN" && handleChildItemType)}
                handleSelectedCheck={handleSelectedCheck}

                // 카테고리 리스트 출력
                categories={(selectedType === "MAIN" && categories)}
                inputDatas={(selectedType === "MAIN" && inputDatas)}

                // 버튼 클릭 함수 전달
                handleAddRow={(selectedType === "MAIN" && handleAddRow)}
                saveCategory={(selectedType === "MAIN" && saveCategory)}
                
                // 선택된 카테고리 출력
                isChecked={isChecked}
                selected={selectedMain}
                
                />               
                    
                {/* 2. 대분류 테이블 */}
                <CategoryTable 
                // 테이블 기본 정보 전달
                title="대분류"
                itemType="CLASS1"
                childItemType="CLASS2"
                parentCls={parentCls}
                itemLvl={1}
                maxLength={1}

                // input 함수 전달
                fetchCategories={fetchCategories}
                handleInputChange={handleInputChange}
                handleChildItemType={(selectedType === "CLASS1" && handleChildItemType)}
                handleSelectedCheck={handleSelectedCheck}                     

                // 카테고리 리스트 출력
                categories={(selectedType === "CLASS1" && categories)}
                inputDatas={(selectedType === "CLASS1" && inputDatas)}
                
                // 버튼 함수 전달
                handleAddRow={(selectedType === "CLASS1" && handleAddRow)}
                saveCategory={(selectedType === "CLASS1" && saveCategory)}
                
                // 선택된 카테고리 출력
                isChecked={isChecked}
                selected={selectedClass1}
                />
                {/* 3. 중분류 테이블 */}
                <CategoryTable 
                // 테이블 기본 정보 전달
                title="중분류"
                itemType="CLASS2"
                childItemType="CLASS3"
                parentCls={parentCls}
                itemLvl={2}
                maxLength={1}

                // input 함수 전달
                fetchCategories={fetchCategories}
                handleInputChange={handleInputChange}
                handleChildItemType={(selectedType === "CLASS2" && handleChildItemType)}
                handleSelectedCheck={handleSelectedCheck}

                // 카테고리 리스트 출력
                categories={(selectedType === "CLASS2" && categories)}
                inputDatas={(selectedType === "CLASS2" && inputDatas)}
                
                // 버튼 함수 전달
                handleAddRow={(selectedType === "CLASS2" && handleAddRow)}
                saveCategory={(selectedType === "CLASS2" && saveCategory)}
                
                // 선택된 카테고리 출력
                isChecked={isChecked}
                selected={selectedClass2}
                />

                {/* 중분류 테이블 */}
                {/* <CategoryTable 
                // 테이블 기본 정보 전달
                title="중분류"
                itemType="CLASS2"
                childItemType="CLASS3"
                itemLvl={2}
                maxLength={1}

                // input 함수 전달
                fetchCategories={fetchCategories}
                handleInputChange={handleInputChange}
                handleChildItemType={handleChildItemType}

                // 카테고리 리스트 출력
                categories={(selectedType === "CLASS2" && categories)}
                inputDatas={(selectedType === "CLASS2" && inputDatas)}
                
                // 버튼 함수 전달
                handleAddRow={(selectedType === "CLASS2" && handleAddRow)}
                saveCategory={(selectedType === "CLASS2" && saveCategory)}
                
                // 선택된 카테고리 출력
                isChecked={(selectedType === "CLASS3" && isChecked)}
                category={(selectedType === "CLASS3" && category)}
                /> */}

                {/* 3. 중분류 테이블 */}
                {/* <CategoryTable 
                title="중분류"                                 
                /> */}

                {/* 4. 소분류 테이블 */}
                {/* <CategoryTable 
                title="소분류"                 
                /> */}

            </div>
        </div>
    </div>

    

      

      
  );
}