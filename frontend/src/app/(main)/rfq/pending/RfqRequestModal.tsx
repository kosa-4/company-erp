'use client';

import React, {useState, useEffect, useCallback} from 'react';
import {
    Modal,
    Card,
    Button,
    Input,
    Select,
    DatePicker,
    DataGrid,
    Badge,
    ModalFooter,
    SearchPanel
} from '@/components/ui';
import {ColumnDef} from '@/types';
import {formatNumber, toLocalDateString} from '@/lib/utils';
import {rfqApi, RfqSaveRequest, RfqDetailResponse} from '@/lib/api/rfq';
// import { vendorApi, VendorDTO } from '@/lib/api/vendor'; // 기존 vendorApi 제거
import {getErrorMessage} from '@/lib/api/error';
import {toast} from 'sonner';

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

    // 협력사 추가/삭제 모달 상태
    const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
    const [vendorList, setVendorList] = useState<any[]>([]); // 타입 유연하게 처리
    const [selectedVendorCodes, setSelectedVendorCodes] = useState<string[]>([]); // 모달 내 선택 (추가용)
    const [selectedDetailVendors, setSelectedDetailVendors] = useState<any[]>([]); // 상세 화면 그리드 내 선택 (삭제용)
    const [vendorSearch, setVendorSearch] = useState({vendorCode: '', vendorName: ''});

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
                // [추가] 신규 생성 시 마감일 기본값 (+7일) 설정
                if (response.header && !response.header.reqCloseDate) {
                    const defaultDate = new Date();
                    defaultDate.setDate(defaultDate.getDate() + 7);
                    response.header.reqCloseDate = toLocalDateString(defaultDate);
                }
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
            setIsVendorModalOpen(false);
            setVendorList([]);
            setSelectedVendorCodes([]);
            setSelectedDetailVendors([]);
        }
    }, [isOpen, fetchDetail]);

    // 협력사 목록 조회 (모달 열릴 때)
    const fetchVendorList = useCallback(async () => {
        try {
            // [수정] 승인된 협력사만 조회하는 신규 API 사용
            const response = await rfqApi.getApprovedVendors(vendorSearch);
            setVendorList(response.vendors || []);
        } catch (error) {
            console.error(error);
            toast.error('협력사 목록을 불러오는데 실패했습니다.');
        }
    }, [vendorSearch]);

    useEffect(() => {
        if (isVendorModalOpen) {
            fetchVendorList();
        }
    }, [isVendorModalOpen, fetchVendorList]);

    // 저장 처리
    const handleSave = async () => {
        if (!detail) return;

        if (!detail.header.rfqSubject) return toast.warning('견적 제목을 입력해주세요.');
        if (!detail.header.rfqType) return toast.warning('견적 유형을 선택해주세요.');
        if (!detail.header.reqCloseDate) return toast.warning('마감 일시를 입력해주세요.');

        // [추가] 마감일 유효성 검사: 현재 날짜 이후여야 함
        const todayStr = toLocalDateString(new Date());
        const closeDateStr = detail.header.reqCloseDate.split('T')[0];
        if (closeDateStr < todayStr) {
            return toast.warning('마감일은 현재 날짜 이후여야 합니다.');
        }

        const saveRequest: RfqSaveRequest = {
            rfqNum: rfqNum || undefined,
            prNum: detail.header.prNum,
            pcType: detail.header.pcType,
            pcTypeNm: detail.header.pcTypeNm,
            rfqSubject: detail.header.rfqSubject,
            rfqType: detail.header.rfqType,
            reqCloseDate: detail.header.reqCloseDate.includes('T')
                ? detail.header.reqCloseDate
                : `${detail.header.reqCloseDate}T23:59:59`,
            rmk: detail.header.rmk,
            vendorCodes: detail.vendors?.map(v => v.vendorCd) || [],
            items: detail.items?.map(item => ({
                lineNo: item.lineNo,
                itemCd: item.itemCd,
                itemDesc: item.itemDesc,
                itemSpec: item.itemSpec,
                unitCd: item.unitCd,
                rfqQt: item.rfqQt,
                estUnitPrc: item.estUnitPrc,
                // [수정] 납기일 포맷팅: 시간 정보 제거하여 LocalDate 정합성 맞춤
                delyDate: item.delyDate ? item.delyDate.split('T')[0] : undefined,
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

    // 전송 처리
    const handleSend = async () => {
        if (!detail || !rfqNum) return;

        if (!detail.vendors || detail.vendors.length === 0) {
            toast.warning('협력사를 선택해주세요.');
            return;
        }

        toast('협력사로 견적 요청을 전송하시겠습니까?\n전송 후에는 품목 수정이 불가능합니다.', {
            action: {
                label: '전송',
                onClick: async () => {
                    try {
                        setLoading(true);
                        const vendorCodes = detail.vendors?.map(v => v.vendorCd) || [];
                        await rfqApi.sendRfq(rfqNum, vendorCodes);
                        toast.success('협력사 전송이 완료되었습니다.');
                        onSaveSuccess?.();
                        onClose();
                    } catch (error) {
                        toast.error(getErrorMessage(error));
                    } finally {
                        setLoading(false);
                    }
                }
            }
        });
    };

    // 삭제 처리
    const handleDelete = async () => {
        if (!rfqNum) return;

        toast('정말 이 견적 요청을 삭제하시겠습니까?', {
            action: {
                label: '삭제',
                onClick: async () => {
                    try {
                        setLoading(true);
                        await rfqApi.deleteRfq(rfqNum);
                        toast.success('삭제되었습니다.');
                        onSaveSuccess?.();
                        onClose();
                    } catch (error) {
                        toast.error(getErrorMessage(error));
                    } finally {
                        setLoading(false);
                    }
                }
            }
        });
    };

    const handleHeaderChange = (field: string, value: any) => {
        if (!detail) return;
        setDetail({
            ...detail,
            header: {...detail.header, [field]: value}
        });
    };

    // 협력사 추가 처리
    const handleAddSelectedVendors = () => {
        if (!detail) return;
        const selectedVendorRows = vendorList.filter(v => selectedVendorCodes.includes(v.vendorCode))
            .map(v => ({
                vendorCd: v.vendorCode,
                vendorNm: v.vendorName,
                progressCd: '', // 아직 요청 전이므로 코드는 비워둠
                progressNm: '요청 전',
                selectYn: 'N'
            }));

        // 중복 제거 후 추가
        const currentVendorCds = (detail.vendors || []).map(v => v.vendorCd);
        const newVendors = selectedVendorRows.filter(v => !currentVendorCds.includes(v.vendorCd));

        setDetail({
            ...detail,
            vendors: [...(detail.vendors || []), ...newVendors]
        });
        setIsVendorModalOpen(false);
        setSelectedVendorCodes([]);
    };

    // 협력사 삭제 처리 (화면 목록에서만 제거)
    const handleRemoveVendors = () => {
        if (!detail || selectedDetailVendors.length === 0) {
            toast.warning('삭제할 협력사를 선택해주세요.');
            return;
        }

        toast(`선택한 ${selectedDetailVendors.length}개 협력사를 목록에서 삭제하시겠습니까?\n(저장 시 반영됩니다)`, {
            action: {
                label: '삭제',
                onClick: () => {
                    const deleteVendorCds = selectedDetailVendors.map(v => v.vendorCd);
                    const newVendors = (detail.vendors || []).filter(v => !deleteVendorCds.includes(v.vendorCd));

                    setDetail({
                        ...detail,
                        vendors: newVendors
                    });
                    setSelectedDetailVendors([]);
                }
            }
        });
    };

    const isEditable = !rfqNum || detail?.header.progressCd === 'T';
    const isSelectionMode = !!rfqNum && detail?.header.progressCd === 'G';

    const itemColumns: ColumnDef<any>[] = [
        {key: 'lineNo', header: 'No', width: 50, align: 'center'},
        {key: 'itemCd', header: '품목코드', width: 120, align: 'center'},
        {key: 'itemDesc', header: '품목명', width: 250, align: 'left'},
        {key: 'itemSpec', header: '규격', width: 150, align: 'left'},
        {key: 'unitCd', header: '단위', width: 70, align: 'center'},
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
                                ? {...item, rfqQt: newValue, estAmt: newValue * (item.estUnitPrc || 0)}
                                : item
                        );
                        setDetail({...detail!, items: newItems});
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
                                ? {...item, estUnitPrc: newUnitPrc, estAmt: (item.rfqQt || 0) * newUnitPrc}
                                : item
                        );
                        setDetail({...detail!, items: newItems});
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
        {key: 'delyDate', header: '납기희망일', width: 120, align: 'center'},
    ];

    const vendorColumns: ColumnDef<any>[] = [
        {key: 'vendorCd', header: '업체코드', width: 100, align: 'center'},
        {key: 'vendorNm', header: '협력사명', width: 180, align: 'left'},
        {
            key: 'progressNm',
            header: '상태',
            width: 100,
            align: 'center',
            render: (val: any) => (
                <Badge variant={val === '요청 전' ? 'gray' : 'blue'}>
                    {String(val || '요청 전')}
                </Badge>
            )
        },
        { key: 'submitDate', header: '제출일시', width: 160, align: 'center' },
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
                            {rfqNum && (
                                <Button variant="danger" onClick={handleDelete} loading={loading}>삭제</Button>
                            )}
                            <Button variant="secondary" onClick={handleSave} loading={loading}>저장</Button>
                            {/* [수정] 전송 버튼 숨김 처리
                            {rfqNum && (
                                <Button variant="primary" onClick={handleSend} loading={loading}>협력사 전송</Button>
                            )}
                            */}
                        </>
                    )}
                </div>
            }
        >
            {loading && !detail ? (
                <div className="p-16 text-center">
                    <div
                        className="animate-spin inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full mb-4"></div>
                    <p className="text-stone-500">데이터를 불러오는 중입니다...</p>
                </div>
            ) : detail ? (
                <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                    {/* 견적 기본 정보 */}
                    <Card title="견적 기본 정보">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Input label="견적번호" value={detail?.header?.rfqNum || ''} readOnly/>
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
                                    {value: 'OC', label: '수의계약'},
                                    {value: 'AC', label: '지명경쟁'},
                                ]}
                                required
                            />
                            <DatePicker
                                label="견적 마감일"
                                value={detail?.header?.reqCloseDate?.split('T')[0] || ''}
                                onChange={(e) => handleHeaderChange('reqCloseDate', e.target.value)}
                                className={isEditable ? 'bg-blue-50/30 ring-1 ring-blue-100' : ''}
                                readOnly={!isEditable}
                                required
                            />
                            <input
                                type="hidden"
                                name="pcType"
                                value={detail?.header?.pcType || ''}
                            />
                            <Input label="구매유형" value={detail?.header?.pcTypeNm || ''} readOnly/>
                            <Input label="PR번호" value={detail?.header?.prNum || ''} readOnly/>
                            <Input label="담당자" value={detail?.header?.ctrlUserNm || ''} readOnly/>
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
                                <div className="flex gap-2">
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={handleRemoveVendors}
                                        disabled={selectedDetailVendors.length === 0}
                                    >
                                        삭제
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setIsVendorModalOpen(true)}
                                    >
                                        추가
                                    </Button>
                                </div>
                            )}
                        >
                            <div className="overflow-x-auto">
                                <DataGrid
                                    columns={vendorColumns}
                                    data={detail?.vendors || []}
                                    keyField="vendorCd"
                                    loading={loading}
                                    emptyMessage="추가된 협력사가 없습니다."
                                    selectable={isEditable}
                                    selectedRows={selectedDetailVendors}
                                    onSelectionChange={setSelectedDetailVendors}
                                />
                            </div>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="p-16 text-center text-stone-500">대상을 찾을 수 없습니다.</div>
            )}
            {/* 협력사 선택 모달 */}
            <Modal
                isOpen={isVendorModalOpen}
                onClose={() => setIsVendorModalOpen(false)}
                title="협력사 선택"
                size="xl"
                footer={
                    <ModalFooter
                        onClose={() => {
                            setIsVendorModalOpen(false);
                            setSelectedVendorCodes([]);
                        }}
                        onConfirm={handleAddSelectedVendors}
                        confirmText="추가"
                    />
                }
            >
                <div className="space-y-4">
                    {/* 검색 영역 */}
                    <div className="grid grid-cols-3 gap-4">
                        <Input
                            label="업체코드"
                            value={vendorSearch.vendorCode}
                            onChange={(e) => setVendorSearch({...vendorSearch, vendorCode: e.target.value})}
                        />
                        <Input
                            label="업체명"
                            value={vendorSearch.vendorName}
                            onChange={(e) => setVendorSearch({...vendorSearch, vendorName: e.target.value})}
                        />
                        <div className="flex items-end">
                            <Button variant="primary" onClick={fetchVendorList}>검색</Button>
                        </div>
                    </div>

                    {/* 협력사 목록 */}
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-stone-50">
                            <tr className="border-b">
                                <th className="w-10 p-3 text-center">
                                    <input
                                        type="checkbox"
                                        checked={vendorList.length > 0 && selectedVendorCodes.length === vendorList.length}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedVendorCodes(vendorList.map(v => v.vendorCode));
                                            } else {
                                                setSelectedVendorCodes([]);
                                            }
                                        }}
                                    />
                                </th>
                                <th className="p-3 text-left text-sm font-semibold text-stone-600">업체코드</th>
                                <th className="p-3 text-left text-sm font-semibold text-stone-600">업체명</th>
                                <th className="p-3 text-left text-sm font-semibold text-stone-600">대표자</th>
                                <th className="p-3 text-left text-sm font-semibold text-stone-600">업종</th>
                            </tr>
                            </thead>
                            <tbody>
                            {vendorList.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-stone-500">
                                        조회된 협력사가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                vendorList.map((vendor) => (
                                    <tr
                                        key={vendor.vendorCode}
                                        className="border-b hover:bg-stone-50 cursor-pointer"
                                        onClick={() => {
                                            if (selectedVendorCodes.includes(vendor.vendorCode)) {
                                                setSelectedVendorCodes(selectedVendorCodes.filter(c => c !== vendor.vendorCode));
                                            } else {
                                                setSelectedVendorCodes([...selectedVendorCodes, vendor.vendorCode]);
                                            }
                                        }}
                                    >
                                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedVendorCodes.includes(vendor.vendorCode)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedVendorCodes([...selectedVendorCodes, vendor.vendorCode]);
                                                    } else {
                                                        setSelectedVendorCodes(selectedVendorCodes.filter(c => c !== vendor.vendorCode));
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td className="p-3 text-sm">{vendor.vendorCode}</td>
                                        <td className="p-3 text-sm font-medium">{vendor.vendorName}</td>
                                        <td className="p-3 text-sm">{vendor.ceoName}</td>
                                        <td className="p-3 text-sm">{vendor.industry}</td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Modal>
        </Modal>
    );
}
