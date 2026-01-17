'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Modal,
    Card,
    Button,
    Input,
    Select,
    DatePicker,
    DataGrid,
    Badge,
    ModalFooter
} from '@/components/ui';
import { ColumnDef } from '@/types';
import { formatNumber } from '@/lib/utils';
import { rfqApi, RfqDetailResponse, RfqSaveRequest } from '@/lib/api/rfq';
import { getErrorMessage } from '@/lib/api/error';
import { toast } from 'sonner';

interface RfqRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    prNum?: string | null;
    rfqNum?: string | null;
    onSaveSuccess?: () => void;
}

export default function RfqRequestModal({
    isOpen,
    onClose,
    prNum,
    rfqNum,
    onSaveSuccess
}: RfqRequestModalProps) {
    const [loading, setLoading] = useState(false);
    const [detail, setDetail] = useState<RfqDetailResponse | null>(null);

    // 데이터 조회
    const fetchDetail = useCallback(async () => {
        if (!rfqNum && !prNum) return;
        setLoading(true);
        try {
            if (rfqNum) {
                const response = await rfqApi.getRfqDetail(rfqNum);
                setDetail(response);
            } else if (prNum) {
                const response = await rfqApi.getRfqInitFromPr(prNum);
                setDetail(response);
            }
        } catch (error) {
            console.error(error);
            toast.error('견적 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [rfqNum, prNum]);

    useEffect(() => {
        if (isOpen) {
            fetchDetail();
        } else {
            setDetail(null);
        }
    }, [isOpen, fetchDetail]);

    // 저장 처리
    const handleSave = async () => {
        if (!detail) return;

        if (!detail.header.rfqSubject) return toast.warning('견적 제목을 입력해주세요.');
        if (!detail.header.rfqType) return toast.warning('견적 유형을 선택해주세요.');
        if (!detail.header.reqCloseDate) return toast.warning('마감 일시를 입력해주세요.');

        const saveRequest: RfqSaveRequest = {
            rfqNum: rfqNum || undefined,
            prNum: detail.header.prNum,
            pcType: detail.header.pcType,
            rfqSubject: detail.header.rfqSubject,
            rfqType: detail.header.rfqType,
            reqCloseDate: detail.header.reqCloseDate,
            rmk: detail.header.rmk,
            vendorCodes: detail.vendors.map(v => v.vendorCd),
            items: detail.items.map(item => ({
                lineNo: item.lineNo,
                itemCd: item.itemCd,
                itemDesc: item.itemDesc,
                itemSpec: item.itemSpec,
                unitCd: item.unitCd,
                rfqQt: item.rfqQt,
                estUnitPrc: item.estUnitPrc,
                delyDate: item.delyDate,
                whNm: item.whNm,
                rmk: item.rmk
            }))
        };

        setLoading(true);
        try {
            if (rfqNum) {
                await rfqApi.saveRfq(rfqNum, saveRequest);
                toast.success('수정되었습니다.');
            } else {
                await rfqApi.createRfq(saveRequest);
                toast.success('견적이 생성되었습니다.');
            }
            onSaveSuccess?.();
            onClose();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    // 전송 처리 (모달에서는 저장 후 별도 진행 권장하나 기능 유지)
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
            onSaveSuccess?.();
            onClose();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleHeaderChange = (field: string, value: any) => {
        if (!detail) return;
        setDetail({
            ...detail,
            header: { ...detail.header, [field]: value }
        });
    };

    const isEditable = !rfqNum || detail?.header.progressCd === 'T';
    const isSelectionMode = !!rfqNum && detail?.header.progressCd === 'G';

    const itemColumns: ColumnDef<any>[] = [
        { key: 'lineNo', header: 'No', width: 50, align: 'center' },
        { key: 'itemCd', header: '품목코드', width: 120, align: 'center' },
        { key: 'itemDesc', header: '품목명', width: 250, align: 'left' },
        { key: 'itemSpec', header: '규격', width: 150, align: 'left' },
        { key: 'unitCd', header: '단위', width: 70, align: 'center' },
        {
            key: 'rfqQt',
            header: '요청수량',
            width: 100,
            align: 'right',
            render: (val, row) => isEditable ? (
                <input
                    type="number"
                    className="w-full text-right border border-stone-200 bg-blue-50/30 focus:bg-white focus:ring-1 focus:ring-teal-500 rounded p-1 transition-colors"
                    value={Number(val)}
                    onChange={(e) => {
                        const newValue = Number(e.target.value);
                        const newItems = detail!.items.map(item =>
                            item.lineNo === row.lineNo
                                ? { ...item, rfqQt: newValue, estAmt: newValue * (item.estUnitPrc || 0) }
                                : item
                        );
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
            render: (val, row) => isEditable ? (
                <input
                    type="number"
                    className="w-full text-right border border-stone-200 bg-blue-50/30 focus:bg-white focus:ring-1 focus:ring-teal-500 rounded p-1 transition-colors"
                    value={Number(val)}
                    onChange={(e) => {
                        const newUnitPrc = Number(e.target.value);
                        const newItems = detail!.items.map(item =>
                            item.lineNo === row.lineNo
                                ? { ...item, estUnitPrc: newUnitPrc, estAmt: (item.rfqQt || 0) * newUnitPrc }
                                : item
                        );
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
    ];

    const vendorColumns: ColumnDef<any>[] = [
        { key: 'vendorCd', header: '업체코드', width: 100, align: 'center' },
        { key: 'vendorNm', header: '협력사명', width: 180, align: 'left' },
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
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`견적요청 작성${rfqNum ? ` [${rfqNum}]` : ''}`}
            size="full"
            footer={
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>취소</Button>
                    {isEditable && (
                        <>
                            <Button variant="secondary" onClick={handleSave} loading={loading}>저장</Button>
                            {rfqNum && (
                                <Button variant="primary" onClick={handleSend} loading={loading}>협력사 전송</Button>
                            )}
                        </>
                    )}
                </div>
            }
        >
            {loading && !detail ? (
                <div className="p-16 text-center">
                    <div className="animate-spin inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mb-4"></div>
                    <p className="text-stone-500">데이터를 불러오는 중입니다...</p>
                </div>
            ) : detail ? (
                <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                    {/* 견적 기본 정보 */}
                    <Card title="견적 기본 정보">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Input label="견적번호" value={detail?.header?.rfqNum || ''} readOnly />
                            <Input
                                label="견적 제목"
                                value={detail?.header?.rfqSubject || ''}
                                onChange={(e) => handleHeaderChange('rfqSubject', e.target.value)}
                                className={isEditable ? 'bg-blue-50/30 ring-1 ring-blue-100' : ''}
                                readOnly={!isEditable}
                                required
                            />
                            <Select
                                label="견적 유형"
                                value={detail?.header?.rfqType || ''}
                                onChange={(e) => handleHeaderChange('rfqType', e.target.value)}
                                className={isEditable ? 'bg-blue-50/30 ring-1 ring-blue-100' : ''}
                                disabled={!isEditable}
                                options={[
                                    { value: 'OC', label: '수의계약' },
                                    { value: 'AC', label: '지명경쟁' },
                                ]}
                                required
                            />
                            <DatePicker
                                label="견적 마감일"
                                value={detail?.header?.reqCloseDate || ''}
                                onChange={(e) => handleHeaderChange('reqCloseDate', e.target.value)}
                                className={isEditable ? 'bg-blue-50/30 ring-1 ring-blue-100' : ''}
                                readOnly={!isEditable}
                                required
                            />
                            <Input label="구매유형" value={detail?.header?.pcType || ''} readOnly />
                            <Input label="PR번호" value={detail?.header?.prNum || ''} readOnly />
                            <Input label="담당자" value={detail?.header?.ctrlUserNm || ''} readOnly />
                            <Input
                                label="진행상태"
                                value={detail?.header?.progressNm || ''}
                                className="font-bold text-teal-600"
                                readOnly
                            />
                        </div>
                        <div className="mt-4">
                            <Input
                                label="비고"
                                value={detail?.header?.rmk || ''}
                                onChange={(e) => handleHeaderChange('rmk', e.target.value)}
                                className={isEditable ? 'bg-blue-50/30 ring-1 ring-blue-100' : ''}
                                readOnly={!isEditable}
                            />
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        {/* 품목 리스트 */}
                        <Card title="견적 품목" className="xl:col-span-2" padding={false}>
                            <div className="overflow-x-auto">
                                <DataGrid
                                    columns={itemColumns}
                                    data={detail?.items || []}
                                    keyField="lineNo"
                                    loading={loading}
                                    emptyMessage="품목 정보가 없습니다."
                                />
                            </div>
                        </Card>

                        {/* 협력사 리스트 */}
                        <Card
                            title="협력사 요청 현황"
                            className="xl:col-span-1"
                            padding={false}
                            actions={isEditable && (
                                <Button variant="secondary" size="sm">추가</Button>
                            )}
                        >
                            <div className="overflow-x-auto">
                                <DataGrid
                                    columns={vendorColumns}
                                    data={detail?.vendors || []}
                                    keyField="vendorCd"
                                    loading={loading}
                                    emptyMessage="추가된 협력사가 없습니다."
                                />
                            </div>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="p-16 text-center text-stone-500">대상을 찾을 수 없습니다.</div>
            )}
        </Modal>
    );
}
