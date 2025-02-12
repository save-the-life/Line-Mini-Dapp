/**
 * 결제 상태 API를 호출하는 함수
 * @param {string} paymentId - 결제 세션의 ID
 * @returns {Promise<string>} - 결제 상태 (예: "CREATED", "STARTED", "CONFIRMED" 등)
 */
async function getPaymentStatus(paymentId: string): Promise<string> {
  try {
    const response = await fetch(`https://payment.dappportal.io/api/payment-v1/payment/status?id=${paymentId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.status;
  } catch (error) {
    console.error("Error fetching payment status:", error);
    throw error;
  }
}

export default getPaymentStatus;
