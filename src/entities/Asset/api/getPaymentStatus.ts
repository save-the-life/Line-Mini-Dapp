/**
 * 결제 상태 API를 호출하는 함수
 * @param {string} paymentId - 결제 세션의 ID
 * @returns {Promise<string>} - 결제 상태 (예: "CREATED", "STARTED", "CONFIRMED" 등)
 */
export const getPaymentStatus = async(paymentId: string): Promise<string> => {
  try {
    console.log("getPaymentStatus 호출됨. paymentId:", paymentId);
    const response = await fetch(`https://payment.dappportal.io/api/payment-v1/payment/status?id=${paymentId}`);
    console.log("응답 상태 코드:", response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("결제 진행 상황 (API 응답): ", data);
    return data.status;
  } catch (error) {
    console.error("Error fetching payment status:", error);
    throw error;
  }
}

export default getPaymentStatus;
