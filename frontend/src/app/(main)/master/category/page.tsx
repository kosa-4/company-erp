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
    const [itemCls, setItemCls] = useState("");
    const [parentCls, setParentCls] = useState("");
    const [selectedType, setSelectedType] = useState("MAIN");

    // 1. 카테고리 조회
    const fetchCategories = async (parentCls: string) => {
        try{
            // 1. 데이터 요청
            console.log("parentCls ", parentCls)
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
            
            setCategories(data);
        } catch(error){
            console.error("데이터 로드 중 오류 발생", error);
            alert("데이터 로드에 실패하였습니다.")
        }
    }

    // 2. 행 추가
    const [inputDatas, setInputDatas] = useState<Category[]>([])
    // const [itemLvl, setItemLvl] = useState(0);
    
    // 2-1. input 생성
    // console.log(parentCls);
    const handleAddRow = (e:any, itemLvl:number) =>{        
        setSelectedType(e.target.value);
        // setItemLvl(itemLvl)
        setParentCls(parentCls)

        // 2-1. 초기값 세팅
        const newInput = {
            itemCls: '',
            itemClsNm:'',
            useFlag: true,
            itemLvl: itemLvl,
            parentItemCls:parentCls,
        };

        // 2-2. null인 경우 처리
        if (!Array.isArray(inputDatas)) {
            setInputDatas([newInput]);
            return;
        }

        // 2-3. 입력값 최신화
        setInputDatas([...inputDatas, newInput]);
        
    }  

    // 3. 변경 사항 저장
    const handleInputChange = (index: number, field: keyof Category, value:any) => {
        const updatedInput = inputDatas.map((data, i) => 
            i === index ? {...data, [field]: value} : data
        );
        setInputDatas(updatedInput);
    }

    // 4. 카테고리 저장
    const saveCategory = async () => {
        // 값 여부 확인
        const data = inputDatas.filter(d => d.itemCls.trim() !== '' && d.itemClsNm.trim() !== '');

        if(data.length === 0){
            alert("저장할 데이터를 입력해주세요");
            return;
        }
        try{
            // 4-1. 데이터 요청
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
            // 4-2.input 초기화
            setInputDatas([]);
            // 4-3. 카테고리 출력
            // fetchCategories();
        } catch(err){
            console.error("데이터 입력 중 오류 발생", err);
        }
    };

    // // 필터
    // const filteredCate = categories.filter((c) =>
    //     c.parentItemCls === parentCls
    // )

    const filteredCateByCls = categories.filter((c) => 
        c.itemCls === itemCls     
          
    )
    
    const handleChildItemType = (e: any, type:any) => {
        const {value, checked} = e.target;
        if(checked){
            setItemCls(value);        
            setParentCls(value);
            setSelectedType(type);
            fetchCategories(value);
            
        } else{
            setItemCls("");
            setParentCls("");
            setSelectedType("MAIN");
            fetchCategories("");
        }

        
    }
    
    useEffect(() => {
        fetchCategories("");
    },[])


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
                title="품목 종류"   
                categories={(selectedType === "MAIN" && categories)}
                inputDatas={(selectedType === "MAIN" && inputDatas)}
                filteredCateByCls={(selectedType === "MAIN" && filteredCateByCls)}
                fetchCategories={fetchCategories}
                handleAddRow={(selectedType === "MAIN" && handleAddRow)}
                handleInputChange={handleInputChange}
                saveCategory={(selectedType === "MAIN" && saveCategory)}
                maxLength={2}
                itemCls={itemCls}
                itemType="MAIN"
                itemLvl={0}
                childItemType="CLASS1"
                handleChildItemType={handleChildItemType}
                // handleParentCls={handleParentCls}       
                />
                
                {/* 2. 대분류 테이블 */}
                <CategoryTable 
                title="대분류"
                categories={(selectedType === "CLASS1" && categories)}
                inputDatas={(selectedType === "CLASS1" && inputDatas)}
                filteredCateByCls={(selectedType === "CLASS1" && filteredCateByCls)}
                fetchCategories={fetchCategories}
                handleAddRow={(selectedType === "CLASS1" && handleAddRow)}
                handleInputChange={handleInputChange}
                saveCategory={(selectedType === "CLASS1" && saveCategory)}
                maxLength={3}
                itemCls={itemCls}
                itemType="CLASS1"
                itemLvl={1}
                childItemType="CLASS2"
                handleChildItemType={handleChildItemType}     
                // handleParentCls={handleParentCls}             
                />

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