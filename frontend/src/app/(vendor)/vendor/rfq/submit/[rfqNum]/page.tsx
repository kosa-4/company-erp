"use client";

import React, { useState, useEffect, useRef } from "react";
import { FileText, Save, Send, ArrowLeft, Calculator } from "lucide-react";
import { toast } from "sonner";
import { Card, Button, Input, DatePicker } from "@/components/ui";
import { rfqApi } from "@/lib/api/rfq";
import { getErrorMessage } from "@/lib/api/error";
import { useRouter } from "next/navigation";

interface QuoteItem {
  lineNo: number;
  itemCd: string;
  itemDesc: string;
  itemSpec: string;
  unitCd: string;
  rfqQt: number;
  quoteUnitPrc: number;
  quoteQt: number;
  quoteAmt: number;
  delyDate: string;
  rmk: string;
}

export default function VendorQuoteEditPage({
  params,
}: {
  params: Promise<{ rfqNum: string }>;
}) {
  const router = useRouter();
  const { rfqNum } = React.use(params);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quoteData, setQuoteData] = useState<any>(null);
  const [items, setItems] = useState<QuoteItem[]>([]);

  const submittingRef = useRef(false);

  const fetchQuoteData = async () => {
    try {
      setLoading(true);
      const data = await rfqApi.getVendorQuote(rfqNum);
      setQuoteData(data);
      setItems(data.items || []);
    } catch (error: any) {
      toast.error(getErrorMessage(error) || "견적 데이터 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuoteData();
  }, [rfqNum]);

  const handleItemChange = (
    lineNo: number,
    field: keyof QuoteItem,
    value: any,
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.lineNo !== lineNo) return item;

        const updated: QuoteItem = { ...item, [field]: value } as QuoteItem;

        if (field === "quoteUnitPrc" || field === "quoteQt") {
          const unitPrc =
            field === "quoteUnitPrc"
              ? parseFloat(value) || 0
              : Number(item.quoteUnitPrc) || 0;

          const qt =
            field === "quoteQt"
              ? parseFloat(value) || 0
              : Number(item.quoteQt) || 0;

          updated.quoteAmt = unitPrc * qt;
        }

        return updated;
      }),
    );
  };

  const calculateTotalAmount = () => {
    return items.reduce((sum, item) => sum + (item.quoteAmt || 0), 0);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await rfqApi.saveVendorQuote(rfqNum, { items });
      toast.success("견적이 임시저장되었습니다.");
    } catch (error: any) {
      toast.error(getErrorMessage(error) || "임시저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const doSubmit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    for (const item of items) {
      if (!item.quoteUnitPrc || item.quoteUnitPrc <= 0) {
        toast.error(`라인 ${item.lineNo}: 견적단가를 입력해주세요.`);
        submittingRef.current = false;
        return;
      }
      if (!item.quoteQt || item.quoteQt <= 0) {
        toast.error(`라인 ${item.lineNo}: 견적수량을 입력해주세요.`);
        submittingRef.current = false;
        return;
      }
    }

    try {
      setSaving(true);
      await rfqApi.submitVendorQuote(rfqNum, { items });
      toast.success("견적이 제출되었습니다.");
      setTimeout(() => router.push("/vendor/rfq/submit"), 800);
    } catch (error: any) {
      toast.error(getErrorMessage(error) || "견적 제출에 실패했습니다.");
    } finally {
      setSaving(false);
      submittingRef.current = false;
    }
  };

  const handleSubmit = () => {
    toast("견적을 제출하시겠습니까? 제출 후에는 수정할 수 없습니다.", {
      action: {
        label: "제출",
        onClick: () => {
          void doSubmit();
        },
      },
      duration: 8000,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!quoteData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">견적 데이터를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="h-10 w-10 p-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">견적서 작성</h1>
            <p className="text-sm text-gray-500">
              {quoteData.rfqNum} - {quoteData.rfqSubject}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleSave}
            disabled={saving}
            icon={<Save className="w-4 h-4" />}
          >
            임시저장
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={saving}
            icon={<Send className="w-4 h-4" />}
          >
            제출하기
          </Button>
        </div>
      </div>

      <div className="bg-gray-900 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">총 견적금액</p>
            <p className="text-2xl font-bold mt-1">
              {new Intl.NumberFormat("ko-KR").format(calculateTotalAmount())}원
            </p>
          </div>
          <div className="p-3 bg-gray-800 rounded-lg">
            <Calculator className="w-6 h-6 text-gray-300" />
          </div>
        </div>
      </div>

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
                  <td className="px-4 py-3 text-center text-gray-600">
                    {item.lineNo}
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {item.itemDesc}
                    </div>
                    <div className="text-xs text-gray-500">{item.itemCd}</div>
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {item.itemSpec || "-"}
                  </td>

                  <td className="px-4 py-3 text-center text-gray-600">
                    {item.unitCd}
                  </td>

                  <td className="px-4 py-3 text-right text-gray-600">
                    {new Intl.NumberFormat("ko-KR").format(item.rfqQt)}
                  </td>

                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      value={item.quoteUnitPrc || ""}
                      onChange={(e) =>
                        handleItemChange(
                          item.lineNo,
                          "quoteUnitPrc",
                          e.target.value,
                        )
                      }
                      className="text-right"
                      placeholder="단가"
                    />
                  </td>

                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      value={item.quoteQt || ""}
                      onChange={(e) =>
                        handleItemChange(
                          item.lineNo,
                          "quoteQt",
                          e.target.value,
                        )
                      }
                      className="text-right"
                      placeholder="수량"
                    />
                  </td>

                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {new Intl.NumberFormat("ko-KR").format(
                      item.quoteAmt || 0,
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <DatePicker
                      value={item.delyDate || ""}
                      onChange={(e) =>
                        handleItemChange(item.lineNo, "delyDate", e.target.value)
                      }
                    />
                  </td>

                  <td className="px-4 py-3">
                    <Input
                      type="text"
                      value={item.rmk || ""}
                      onChange={(e) =>
                        handleItemChange(item.lineNo, "rmk", e.target.value)
                      }
                      placeholder="비고"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>안내:</strong> 모든 품목의 견적단가와 수량을 입력한 후
          제출해주세요. 제출 후에는 수정할 수 없습니다.
        </p>
      </div>
    </div>
  );
}
