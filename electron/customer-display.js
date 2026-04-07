function formatCurrency(value) {
  try {
    return (
      new Intl.NumberFormat("th-TH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(value || 0)) + " บาท"
    );
  } catch {
    return `${Number(value || 0).toFixed(2)} บาท`;
  }
}

function renderWaiting() {
  document.getElementById("app").innerHTML = `
    <div class="full-center">
      <div class="waiting-box">
        <div class="waiting-title">พร้อมรับการชำระเงิน</div>
        <div class="waiting-desc">
          หน้าจอนี้จะแสดง QR สำหรับลูกค้าเมื่อเลือกชำระแบบโอนเงิน
        </div>
      </div>
    </div>
  `;
}

function renderTransfer(state) {
  const qr = state.qrDataUrl
    ? `<img class="qr-image" src="${state.qrDataUrl}" alt="PromptPay QR" />`
    : `<div class="qr-empty">กำลังสร้าง QR</div>`;

  document.getElementById("app").innerHTML = `
    <div class="wrap">
      <div class="panel left">
        <div class="brand">
          <div class="brand-badge">
            <img src="../assets/QuickPOS.svg" alt="QuickPOS Logo" />
          </div>
          <div>
            <div class="shop-name">${state.shopName || "-"}</div>
            <div class="subtitle">${
              state.receiptHeaderNote || "สแกนเพื่อชำระเงิน"
            }</div>
          </div>
        </div>

        <div class="receipt-box">
          <div class="receipt-label">เลขที่ใบเสร็จ</div>
          <div class="receipt-no">${state.receiptNo || "-"}</div>
        </div>

        <div class="headline">ชำระเงินด้วยพร้อมเพย์</div>
        <div class="desc">กรุณาใช้แอปธนาคารสแกน QR ทางด้านขวาเพื่อชำระเงิน</div>

        <div class="instruction-list">
          <div class="instruction-item">
            <div class="instruction-dot">1</div>
            <div class="instruction-text">เปิดแอปธนาคารบนมือถือของคุณ</div>
          </div>
          <div class="instruction-item">
            <div class="instruction-dot">2</div>
            <div class="instruction-text">เลือกเมนูสแกน QR เพื่อชำระเงิน</div>
          </div>
          <div class="instruction-item">
            <div class="instruction-dot">3</div>
            <div class="instruction-text">แสดงหลักฐานการโอนให้เจ้าหน้าที่ตรวจสอบ</div>
          </div>
        </div>

        <div class="amount-card">
          <div class="amount-label">ยอดชำระ</div>
          <div class="amount-value">${formatCurrency(state.total)}</div>
          <div class="hint">กรุณาชำระตามยอดนี้เท่านั้น</div>
        </div>
      </div>

      <div class="panel right">
        <div class="qr-panel">
          <div class="qr-title">PromptPay QR</div>
          <div class="qr-subtitle">สแกนจ่ายตามยอดที่แสดง</div>

          <div class="qr-image-wrap">
            ${qr}
          </div>

          <div class="scan-badge">
            <span class="scan-dot"></span>
            พร้อมให้สแกนชำระเงิน
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderState(state) {
  if (!state || state.mode !== "transfer") {
    renderWaiting();
    return;
  }

  renderTransfer(state);
}

renderWaiting();

window.customerDisplay.onStateChange((state) => {
  renderState(state);
});