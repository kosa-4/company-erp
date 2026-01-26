'use client';

import React, { useState, useEffect } from 'react';
import { Save, Send, X, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { Modal, Card, Button, Input, DatePicker } from '@/components/ui';
import { rfqApi } from '@/lib/api/rfq';
import { formatNumber } from '@/lib/utils';

interface QuoteItem {
  lineNo: number;
  itemCd: string;
  itemDesc: string;
  itemSpec: string;
  unitCd: string;
  rfqQt: number;
  quoteUnitPrc: number | string;
  quoteQt: number;
  quoteAmt: number | string;
  delyDate: string;
  rmk: string;
}

interface VendorQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  rfqNum: string | null;
  onSuccess?: () => void;
  readOnly?: boolean;
}

export default function VendorQuoteModal({
  isOpen,
  onClose,
  rfqNum,
  onSuccess,
  readOnly = false,
}: VendorQuoteModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [quoteData, setQuoteData] = useState<any>(null);
  const [items, setItems] = useState<QuoteItem[]>([]);

  // 견적 데이터 조회
  const fetchQuoteData = async () => {
    if (!rfqNum) return;

    try {
      setLoading(true);
      const data = await rfqApi.getVendorQuote(rfqNum);
      setQuoteData(data);
      setItems(data.items || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '견적 데이터 조회에 실패했습니다.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && rfqNum) {
      fetchQuoteData();
    } else {
      setQuoteData(null);
      setItems([]);
    }
  }, [isOpen, rfqNum]);

  // 품목 데이터 변경
  const handleItemChange = (lineNo: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.lineNo === lineNo) {
          const updated = { ...item, [field]: value };

          // 금액 자동 계산
          if (field === 'quoteUnitPrc' || field === 'quoteQt') {
            const unitPrc =
              field === 'quoteUnitPrc'
                ? parseFloat(value) || 0
                : (typeof item.quoteUnitPrc === 'string' ? parseFloat(item.quoteUnitPrc) : item.quoteUnitPrc) || 0;
            const qt =
              field === 'quoteQt' ? parseFloat(value) || 0 : item.quoteQt;
            updated.quoteAmt = unitPrc * qt;
          }

          return updated;
        }
        return item;
      }),
    );
  };

  // 총액 계산
  const calculateTotalAmount = () => {
    return items.reduce((sum, item) => {
      const amt = typeof item.quoteAmt === 'string' ? parseFloat(item.quoteAmt) : item.quoteAmt;
      return sum + (amt || 0);
    }, 0);
  };

  // 저장
  const handleSave = async () => {
    if (!rfqNum) return;

    try {
      setSaving(true);
      await rfqApi.saveVendorQuote(rfqNum, { items });
      toast.success('견적이 저장되었습니다.');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 제출 실행 로직
  const doSubmit = async () => {
    try {
      setSaving(true);
      await rfqApi.submitVendorQuote(rfqNum!, { items });
      toast.success('견적이 제출되었습니다.');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || '견적 제출에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 제출 버튼 핸들러 (검증 및 컨펌)
  const handleSubmit = async () => {
    if (!rfqNum) return;

    // 필수 항목 검증
    for (const item of items) {
      const unitPrc = typeof item.quoteUnitPrc === 'string' ? parseFloat(item.quoteUnitPrc) : item.quoteUnitPrc;
      if (!unitPrc || unitPrc <= 0) {
        toast.error(`라인 ${item.lineNo}: 견적단가를 입력해주세요.`);
        return;
      }
      if (!item.quoteQt || item.quoteQt <= 0) {
        toast.error(`라인 ${item.lineNo}: 견적수량을 입력해주세요.`);
        return;
      }
    }

    toast('견적을 제출하시겠습니까? 제출 후에는 수정할 수 없습니다.', {
      action: {
        label: '제출',
        onClick: () => {
          void doSubmit();
        },
      },
      duration: 5000,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={readOnly ? `견적서 확인 - ${quoteData?.rfqNum}` : `견적서 작성 ${quoteData ? `- ${quoteData.rfqNum}` : ''}`}
      size="full"
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="text-sm text-gray-600">
            <strong>총 견적금액:</strong>{' '}
            <span className="text-lg font-bold text-gray-900 ml-2">
              {formatNumber(calculateTotalAmount())}원
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              {readOnly ? '닫기' : '취소'}
            </Button>
            {!readOnly && (
              <>
                <Button
                  variant="secondary"
                  onClick={handleSave}
                  disabled={saving || loading}
                  icon={<Save className="w-4 h-4" />}
                >
                  저장
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={saving || loading}
                  icon={<Send className="w-4 h-4" />}
                >
                  제출하기
                </Button>
              </>
            )}
          </div>
        </div>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      ) : !quoteData ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">견적 데이터를 찾을 수 없습니다.</div>
        </div>
      ) : (
        <div className="space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
          {/* 견적 정보 */}
          <Card>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">견적번호</p>
                <p className="font-medium">{quoteData.rfqNum}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">견적명</p>
                <p className="font-medium">{quoteData.rfqSubject}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">마감일</p>
                <p className="font-medium">
                  {quoteData.reqCloseDate
                    ? new Date(quoteData.reqCloseDate).toLocaleDateString('ko-KR')
                    : '-'}
                </p>
              </div>
            </div>
          </Card>

          {/* 품목 테이블 */}
          <Card padding={false} className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 font-medium text-center w-16">No</th>
                    <th className="px-4 py-3 font-medium">품목명</th>
                    <th className="px-4 py-3 font-medium">규격</th>
                    <th className="px-4 py-3 font-medium text-center">단위</th>
                    <th className="px-4 py-3 font-medium text-right">요청수량</th>
                    <th className="px-4 py-3 font-medium text-right">견적단가</th>
                    <th className="px-4 py-3 font-medium text-right">견적수량</th>
                    <th className="px-4 py-3 font-medium text-right">견적금액</th>
                    <th className="px-4 py-3 font-medium">납기일</th>
                    <th className="px-4 py-3 font-medium">비고</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr key={item.lineNo} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-center text-gray-600">{item.lineNo}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{item.itemDesc}</div>
                        <div className="text-xs text-gray-500">{item.itemCd}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{item.itemSpec || '-'}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{item.unitCd}</td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {new Intl.NumberFormat('ko-KR').format(item.rfqQt)}
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          value={item.quoteUnitPrc || ''}
                          onChange={(e) =>
                            handleItemChange(item.lineNo, 'quoteUnitPrc', e.target.value)
                          }
                          className="text-right"
                          placeholder="단가"
                          disabled={readOnly}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          value={item.quoteQt || ''}
                          onChange={(e) =>
                            handleItemChange(item.lineNo, 'quoteQt', e.target.value)
                          }
                          className="text-right"
                          placeholder="수량"
                          disabled={readOnly}
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {formatNumber(item.quoteAmt)}
                      </td>
                      <td className="px-4 py-3">
                        <DatePicker
                          value={item.delyDate || ''}
                          onChange={(e) =>
                            handleItemChange(item.lineNo, 'delyDate', e.target.value)
                          }
                          disabled={readOnly}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Input
                          type="text"
                          value={item.rmk || ''}
                          onChange={(e) =>
                            handleItemChange(item.lineNo, 'rmk', e.target.value)
                          }
                          placeholder="비고"
                          disabled={readOnly}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* 안내 메시지 */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>안내:</strong> 모든 품목의 견적단가와 수량을 입력한 후 제출해주세요.
              제출 후에는 수정할 수 없습니다.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
