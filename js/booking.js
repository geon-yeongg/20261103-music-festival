/* ============================================================
   FREQ! 별도 티켓 신청 데모 페이지
   기능: 티켓 유형·수량 선택, 실시간 요약, 입력 검사, 결과 팝업
   주의: 실제 결제 / 서버 저장 / 메일 전송 기능이 없습니다.
   개인정보는 결과 창 표시용으로만 일시 사용합니다.
   ============================================================ */

const ticketTypes = {
  sat: { label: '토요일 1일권', date: '05.22 SAT', price: 49000 },
  sun: { label: '일요일 1일권', date: '05.23 SUN', price: 49000 },
  weekend: { label: '주말 2일 통합권', date: '05.22–23 WEEKEND', price: 79000 },
};
let quantity = 1;
const formatMoney = value => `${value.toLocaleString('ko-KR')}원`;
const getSelectedType = () => document.querySelector('input[name="ticketType"]:checked').value;

// 티켓 금액과 상세 요약을 실시간으로 갱신합니다.
function updateSummary() {
  const choice = ticketTypes[getSelectedType()];
  document.getElementById('summaryDate').textContent = choice.date;
  document.getElementById('summaryTicket').textContent = choice.label;
  document.getElementById('summaryQty').textContent = `${quantity}매`;
  document.getElementById('summaryTotal').textContent = formatMoney(choice.price * quantity);
  document.getElementById('qtyOutput').textContent = String(quantity);
  document.getElementById('ticketQty').value = String(quantity);
  document.getElementById('qtyMinus').disabled = quantity <= 1;
  document.getElementById('qtyPlus').disabled = quantity >= 4;
  document.querySelectorAll('.ticket-option').forEach(label => {
    label.classList.toggle('is-selected', label.querySelector('input').checked);
  });
}

document.querySelectorAll('input[name="ticketType"]').forEach(radio => radio.addEventListener('change', updateSummary));
document.getElementById('qtyMinus').addEventListener('click', () => { quantity = Math.max(1,quantity - 1); updateSummary(); });
document.getElementById('qtyPlus').addEventListener('click', () => { quantity = Math.min(4,quantity + 1); updateSummary(); });
updateSummary();

// 오류가 있는 경우 입력칸 바로 아래에 설명을 보여줍니다.
function setError(id, message) {
  const input = document.getElementById(id);
  const error = document.getElementById({buyerName:'nameError',buyerPhone:'phoneError',buyerEmail:'emailError'}[id]);
  if (error) error.textContent = message;
  if (input) {input.classList.toggle('input-invalid', Boolean(message));input.setAttribute('aria-invalid',String(Boolean(message)));}
}
['buyerName','buyerPhone','buyerEmail'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => setError(id,''));
});
document.getElementById('agreement').addEventListener('change', () => { document.getElementById('agreeError').textContent = ''; });

// 개인정보를 외부로 전송하거나 브라우저에 영구 저장하지 않습니다.
document.getElementById('bookingForm').addEventListener('submit', event => {
  event.preventDefault();
  const name = document.getElementById('buyerName').value.trim();
  const phone = document.getElementById('buyerPhone').value.trim();
  const email = document.getElementById('buyerEmail').value.trim();
  const agree = document.getElementById('agreement').checked;
  let valid = true;
  const fail = (id, message) => {setError(id,message);valid = false;};
  if (name.length < 2) fail('buyerName','이름을 두 글자 이상 입력해 주세요.'); else setError('buyerName','');
  // 대한민국 휴대전화 일반 형식 검사 (하이픈은 선택 사항)
  if (!/^01[016789]-?\d{3,4}-?\d{4}$/.test(phone.replace(/\s/g,''))) fail('buyerPhone','올바른 휴대전화 번호를 입력해 주세요.'); else setError('buyerPhone','');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) fail('buyerEmail','올바른 이메일 주소를 입력해 주세요.'); else setError('buyerEmail','');
  document.getElementById('agreeError').textContent = agree ? '' : '데모 신청 안내 확인이 필요합니다.';
  if (!agree) valid = false;
  if (!valid) {
    const errorInput = document.querySelector('.input-invalid') || (!agree && document.getElementById('agreement'));
    if (errorInput) errorInput.focus();
    return;
  }
  // 결과 UI를 텍스트 노드로 만들어 HTML 삽입 공격을 방지합니다.
  const selected = ticketTypes[getSelectedType()];
  const fields = [
    ['신청자',name],['티켓',selected.label],['행사 날짜',selected.date],
    ['신청 수량',`${quantity}매`],['데모 총액',formatMoney(selected.price*quantity)],
    ['신청 상태','시연 완료 (실제 예약 아님)'],
  ];
  const detail = document.getElementById('resultDetail'); detail.replaceChildren();
  const dl = document.createElement('dl');
  fields.forEach(([title,value]) => {
    const row=document.createElement('div'); const dt=document.createElement('dt'); const dd=document.createElement('dd');
    dt.textContent=title; dd.textContent=value; row.append(dt,dd); dl.append(row);
  });
  detail.append(dl);
  document.getElementById('bookingResult').showModal();
});

// 결과 팝업 닫기. 완료 후에도 폼은 남아 있어 다시 체험할 수 있습니다.
const resultDialog = document.getElementById('bookingResult');
document.getElementById('closeResult').addEventListener('click', () => resultDialog.close());
document.getElementById('resultDone').addEventListener('click', () => resultDialog.close());
resultDialog.addEventListener('click', event => {if (event.target === resultDialog) resultDialog.close();});
