// ======================
// ALARM JADWAL PELAJARAN
// ======================

let alarmAktif = true;

// bikin audio alarm
const alarmSound = new Audio(
  "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
);

function cekAlarmJadwal() {

    if (!alarmAktif) return;

    const sekarang = new Date();

    let jam = sekarang.getHours().toString().padStart(2, "0");
    let menit = sekarang.getMinutes().toString().padStart(2, "0");

    const waktuSekarang = `${jam}:${menit}`;

    // ambil semua input mapel
    const semuaInput = document.querySelectorAll(".mapel-input");

    semuaInput.forEach(input => {

        const cell = input.closest("td");

        if (!cell) return;

        const jamText = cell.querySelector(".jam-text");

        if (!jamText) return;

        const waktuJadwal = jamText.innerText.trim();

        const mapel = input.value.trim();

        if (
            waktuJadwal === waktuSekarang &&
            mapel !== "" &&
            !cell.dataset.sudahBunyi
        ) {

            cell.dataset.sudahBunyi = "true";

            tampilkanNotif(mapel, waktuJadwal);

            alarmSound.play();

        }

        // reset supaya besok bisa bunyi lagi
        if (waktuJadwal !== waktuSekarang) {
            cell.dataset.sudahBunyi = "";
        }

    });

}

// cek tiap 10 detik
setInterval(cekAlarmJadwal, 10000);

// ======================
// NOTIF CUSTOM
// ======================

function tampilkanNotif(mapel, jam) {

    const notif = document.createElement("div");

    notif.innerHTML = `
        <div style="
            position:fixed;
            top:20px;
            right:20px;
            background:#1e1e2f;
            color:white;
            padding:20px;
            border-radius:12px;
            z-index:9999;
            box-shadow:0 0 20px rgba(0,0,0,0.5);
            min-width:250px;
            animation:slideNotif 0.4s ease;
        ">
            <h3 style="margin:0 0 10px;">
                🔔 Alarm Jadwal
            </h3>

            <p style="margin:0;">
                Sekarang jam <b>${jam}</b><br>
                Pelajaran: <b>${mapel}</b>
            </p>
        </div>
    `;

    document.body.appendChild(notif);

    setTimeout(() => {
        notif.remove();
    }, 5000);

}

// animasi notif
const style = document.createElement("style");

style.innerHTML = `
@keyframes slideNotif {
    from{
        transform:translateX(100%);
        opacity:0;
    }
    to{
        transform:translateX(0);
        opacity:1;
    }
}
`;

document.head.appendChild(style);
