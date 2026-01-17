'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    PageHeader,
    Card,
    Button,
    Input,
    Select,
    DatePicker,
    DataGrid,
    Badge,
} from '@/components/ui';
import { ColumnDef } from '@/types';
import { formatNumber } from '@/lib/utils';
import { rfqApi, RfqDetailResponse, RfqSaveRequest } from '@/lib/api/rfq';
import { getErrorMessage } from '@/lib/api/error';
import { toast } from 'sonner';

export default function RfqRequestPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const rfqNum = searchParams.get('rfqNum');

    const [loading, setLoading] = useState(false);
    const [detail, setDetail] = useState<RfqDetailResponse | null>(null);

    // 데이터 조회
    const fetchDetail = useCallback(async () => {
        if (!rfqNum) return;
        setLoading(true);
        try {
            const response = await rfqApi.getRfqDetail(rfqNum);
            setDetail(response);
        } catch (error) {
            console.error(error);
            toast.error('견적 상세 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [rfqNum]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    // 저장 처리
    const handleSave = async () => {
        if (!detail || !rfqNum) return;

        // 기본 검증
        if (!detail.header.rfqSubject) return toast.warning('견적 제목을 입력해주세요.');
        if (!detail.header.rfqType) return toast.warning('견적 유형을 선택해주세요.');
        if (!detail.header.reqCloseDate) return toast.warning('마감 일시를 입력해주세요.');

        const saveRequest: RfqSaveRequest = {
            rfqSubject: detail.header.rfqSubject,
            rfqType: detail.header.rfqType,
            reqCloseDate: detail.header.reqCloseDate,
            rmk: detail.header.rmk,
            items: detail.items.map(item => ({
                lineNo: item.lineNo,
                itemCd: item.itemCd,
                rfqQt: item.rfqQt,
                estUnitPrc: item.estUnitPrc,
                delyDate: item.delyDate,
                whNm: item.whNm,
                rmk: item.rmk
            }))
        };

        setLoading(true);
        try {
            await rfqApi.saveRfq(rfqNum, saveRequest);
            toast.success('임시저장 되었습니다.');
            fetchDetail();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    // 전송 처리
    const handleSend = async () => {
        if (!detail || !rfqNum) return;

        if (detail.vendors.length === 0) {
            return toast.warning('전송할 협력사를 추가해주세요.');
        }

        if (!confirm('협력사로 견적 요청을 전송하시겠습니까?\n전송 후에는 품목 수정이 불가능합니다.')) {
            return;
        }

        setLoading(true);
        try {
            const vendorCodes = detail.vendors.map(v => v.vendorCd);
            await rfqApi.sendRfq(rfqNum, vendorCodes);
            toast.success('협력사 전송이 완료되었습니다.');
            fetchDetail();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    // 업체 선정 처리
    const handleSelectVendor = async (vendorCd: string) => {
        if (!rfqNum) return;

        if (!confirm('해당 업체를 최종 선정하시겠습니까?')) {
            return;
        }

        setLoading(true);
        try {
            await rfqApi.selectVendor(rfqNum, vendorCd);
            toast.success('업체 선정이 완료되었습니다.');
            fetchDetail();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    // 폼 필드 변경 핸들러
    const handleHeaderChange = (field: string, value: any) => {
        if (!detail) return;
        setDetail({
            ...detail,
            header: { ...detail.header, [field]: value }
        });
    };

    // 상태에 따른 제어 값
    const isEditable = detail?.header.progressCd === 'T'; // 임시저장 상태만 수정 가능
    const isSelectionMode = detail?.header.progressCd === 'G'; // 개찰 상태일 때만 선정 가능

    // 품목 그리드 컬럼
    const itemColumns: ColumnDef<any>[] = [
        { key: 'lineNo', header: 'No', width: 50, align: 'center' },
        { key: 'itemCd', header: '품목코드', width: 120, align: 'center' },
        { key: 'itemDesc', header: '품목명', align: 'left' },
        { key: 'itemSpec', header: '규격', width: 150, align: 'left' },
        { key: 'unitCd', header: '단위', width: 70, align: 'center' },
        {
            key: 'rfqQt',
            header: '요청수량',
            width: 100,
            align: 'right',
            render: (val, row, idx) => isEditable ? (
                <input
                    type="number"
                    className="w-full text-right border-none bg-transparent focus:ring-1 focus:ring-teal-500 rounded"
                    value={Number(val)}
                    onChange={(e) => {
                        const newItems = [...detail!.items];
                        newItems[idx].rfqQt = Number(e.target.value);
                        newItems[idx].estAmt = newItems[idx].rfqQt * (newItems[idx].estUnitPrc || 0);
                        setDetail({ ...detail!, items: newItems });
                    }}
                />
            ) : formatNumber(Number(val))
        },
        {
            key: 'estUnitPrc',
            header: '예상단가',
            width: 120,
            align: 'right',
            render: (val, row, idx) => isEditable ? (
                <input
                    type="number"
                    className="w-full text-right border-none bg-transparent focus:ring-1 focus:ring-teal-500 rounded"
                    value={Number(val)}
                    onChange={(e) => {
                        const newItems = [...detail!.items];
                        newItems[idx].estUnitPrc = Number(e.target.value);
                        newItems[idx].estAmt = (newItems[idx].rfqQt || 0) * newItems[idx].estUnitPrc;
                        setDetail({ ...detail!, items: newItems });
                    }}
                />
            ) : `₩${formatNumber(Number(val))}`
        },
        {
            key: 'estAmt',
            header: '예상금액',
            width: 130,
            align: 'right',
            render: (val) => `₩${formatNumber(Number(val || 0))}`
        },
        { key: 'delyDate', header: '납기희망일', width: 120, align: 'center' },
        { key: 'whNm', header: '저장위치', width: 120, align: 'left' },
    ];

    // 협력사 그리드 컬럼
    const vendorColumns: ColumnDef<any>[] = [
        { key: 'vendorCd', header: '업체코드', width: 100, align: 'center' },
        { key: 'vendorNm', header: '협력사명', align: 'left' },
        {
            key: 'progressNm',
            header: '상태',
            width: 100,
            align: 'center',
            render: (val) => <Badge variant="blue">{String(val)}</Badge>
        },
        { key: 'submitDate', header: '제출일시', width: 160, align: 'center' },
        {
            key: 'totalAmt',
            header: '견적총액',
            width: 130,
            align: 'right',
            render: (val) => val ? `₩${formatNumber(Number(val))}` : '-'
        },
        {
            key: 'selection',
            header: '선정',
            width: 100,
            align: 'center',
            render: (_, row) => (
                <Button
                    variant={row.selectYn === 'Y' ? 'primary' : 'secondary'}
                    size="sm"
                    disabled={!isSelectionMode}
                    onClick={() => handleSelectVendor(row.vendorCd)}
                >
                    {row.selectYn === 'Y' ? '선정됨' : '선정'}
                </Button>
            )
        },
    ];

    if (!detail && !loading) {
        return <div className="p-8 text-center text-stone-500">대상을 찾을 수 없습니다.</div>;
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="견적요청 관리"
                subtitle={`[${detail?.header.rfqNum || '신규'}] 견적 정보를 작성하고 협력사에 요청합니다.`}
                actions={
                    <div className="flex gap-2">
                        {isEditable && (
                            <>
                                <Button variant="secondary" onClick={handleSave} loading={loading}>저장</Button>
                                <Button variant="primary" onClick={handleSend} loading={loading}>협력사 전송</Button>
                            </>
                        )}
                        <Button variant="outline" onClick={() => router.back()}>목록으로</Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* 견적 기본 정보 */}
                <Card title="견적 기본 정보" className="xl:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Input label="견적번호" value={detail?.header.rfqNum || ''} readOnly />
                        <Input
                            label="견적 제목"
                            value={detail?.header.rfqSubject || ''}
                            onChange={(e) => handleHeaderChange('rfqSubject', e.target.value)}
                            readOnly={!isEditable}
                            required
                        />
                        <Select
                            label="견적 유형"
                            value={detail?.header.rfqType || ''}
                            onChange={(e) => handleHeaderChange('rfqType', e.target.value)}
                            disabled={!isEditable}
                            options={[
                                { value: 'OC', label: '수의계약' },
                                { value: 'AC', label: '지명경쟁' },
                            ]}
                            required
                        />
                        <DatePicker
                            label="견적 마감일"
                            value={detail?.header.reqCloseDate || ''}
                            onChange={(e) => handleHeaderChange('reqCloseDate', e.target.value)}
                            readOnly={!isEditable}
                            required
                        />
                        <Input label="구매유형" value={detail?.header.pcType || ''} readOnly />
                        <Input label="PR번호" value={detail?.header.prNum || ''} readOnly />
                        <Input label="담당자" value={detail?.header.ctrlUserNm || ''} readOnly />
                        <Input
                            label="진행상태"
                            value={detail?.header.progressNm || ''}
                            className="font-bold text-teal-600"
                            readOnly
                        />
                    </div>
                    <div className="mt-4">
                        <Input
                            label="비고"
                            value={detail?.header.rmk || ''}
                            onChange={(e) => handleHeaderChange('rmk', e.target.value)}
                            readOnly={!isEditable}
                        />
                    </div>
                </Card>

                {/* 품목 리스트 */}
                <Card title="견적 품목" className="xl:col-span-2" padding={false}>
                    <DataGrid
                        columns={itemColumns}
                        data={detail?.items || []}
                        keyField="lineNo"
                        loading={loading}
                        emptyMessage="품목 정보가 없습니다."
                    />
                </Card>

                {/* 협력사 리스트 */}
                <Card
                    title="협력사 요청 현황"
                    className="xl:col-span-1"
                    padding={false}
                    actions={isEditable && (
                        <Button variant="secondary" size="sm">협력사 추가</Button>
                    )}
                >
                    <DataGrid
                        columns={vendorColumns}
                        data={detail?.vendors || []}
                        keyField="vendorCd"
                        loading={loading}
                        emptyMessage="추가된 협력사가 없습니다."
                    />
                </Card>
            </div>
        </div>
    );
}
