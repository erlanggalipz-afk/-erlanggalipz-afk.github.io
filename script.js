const hariList = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
let temp = {}, current = null;

init();

function init() {

    let hariDiv = document.getElementById("hari");

    hariList.forEach(h => {

        let btn = document.createElement("div");

        btn.innerText = h;

        btn.className = "hari-btn";

        btn.onclick = () => pilihHari(btn, h);

        hariDiv.appendChild(btn);

    });

    load();

}

function getJadwal() {

    return JSON.parse(
        localStorage.getItem("jadwal")
    ) || {};

}

function pilihHari(btn, hari) {

    if (current) {

        let inputs =
        document.querySelectorAll(".list input");

        temp[current] = [];

        inputs.forEach(i => {

            if (i.value)
                temp[current].push(
                    formatJam(i.value)
                );

        });

    }

    document
    .querySelectorAll(".hari-btn")
    .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    current = hari;

    let jamDiv =
    document.getElementById("jam");

    jamDiv.innerHTML = "";

    let box =
    document.createElement("div");

    box.className = "jam-box";

    box.innerHTML = `

        <h4>${hari}</h4>

        <div class="list"></div>

        <button onclick="tambah()">
            + Jam
        </button>

        <button onclick="copyHari()">
            Copy di setiap hari?
        </button>

        <button
            onclick="batalHari()"
            style="background:#888;"
        >
            Batal
        </button>

    `;

    jamDiv.appendChild(box);

    let list =
    box.querySelector(".list");

    let data = getJadwal();

    let gabung =
    new Set([
        ...(data[hari] || []),
        ...(temp[hari] || [])
    ]);

    Array.from(gabung).forEach(j => {

        let input =
        document.createElement("input");

        input.value = j;

        list.appendChild(input);

    });

}

function tambah() {

    let input =
    document.createElement("input");

    input.placeholder =
    "Contoh: 8 / 800 / 845";

    document
    .querySelector(".list")
    .appendChild(input);

}

function formatJam(input) {

    input =
    input.replace(/[^0-9]/g, "");

    if (input.length === 1)
        return "0" + input + ":00";

    if (input.length === 2)
        return input + ":00";

    if (input.length === 3)
        return "0" + input[0] + ":" + input.slice(1);

    if (input.length === 4)
        return input.slice(0, 2) + ":" + input.slice(2);

    return input;

}

function copyHari() {

    if (!current)
        return showNotif("⚠️ Pilih hari dulu!");

    let inputs =
    document.querySelectorAll(".list input");

    let isi = [];

    inputs.forEach(i => {

        if (i.value) {

            let j =
            formatJam(i.value);

            i.value = j;

            isi.push(j);

        }

    });

    if (!isi.length)
        return showNotif("⚠️ Tidak ada jam!");

    let data = getJadwal();

    let lama =
    data[current] || [];

    data[current] =
    Array.from(
        new Set([...lama, ...isi])
    );

    localStorage.setItem(
        "jadwal",
        JSON.stringify(data)
    );

    showCopyPopup(isi);

}

function showCopyPopup(jamList) {

    let popup =
    document.createElement("div");

    popup.className = "popup";

    popup.innerHTML = `

        <div class="popup-box">

            <h3>
                Copy ke hari kerja
            </h3>

            <p>
                Tambahkan juga:
            </p>

            <label>
                <input
                    type="checkbox"
                    value="Sabtu"
                >
                Sabtu
            </label>

            <br>

            <label>
                <input
                    type="checkbox"
                    value="Minggu"
                >
                Minggu
            </label>

            <br><br>

            <button onclick="prosesCopy()">
                Copy
            </button>

            <button onclick="tutupPopup()">
                Batal
            </button>

        </div>

    `;

    document.body.appendChild(popup);

    window._copyData = jamList;

}

function prosesCopy() {

    let data = getJadwal();

    let target =
    hariList.filter(h =>
        h !== current &&
        h !== "Sabtu" &&
        h !== "Minggu"
    );

    document
    .querySelectorAll(".popup input:checked")
    .forEach(c => {

        target.push(c.value);

    });

    target.forEach(h => {

        let lama =
        data[h] || [];

        data[h] =
        Array.from(
            new Set([
                ...lama,
                ...window._copyData
            ])
        );

    });

    localStorage.setItem(
        "jadwal",
        JSON.stringify(data)
    );

    tutupPopup();

    load();

    showNotif("✅ Copy berhasil!");

}

function tutupPopup() {

    document
    .querySelector(".popup")
    .remove();

}

function batalHari() {

    delete temp[current];

    current = null;

    document
    .getElementById("jam")
    .innerHTML = "";

    document
    .querySelectorAll(".hari-btn")
    .forEach(b =>
        b.classList.remove("active")
    );

    showNotif("❌ Dibatalkan");

}

function simpan() {

    if (!current)
        return showNotif("⚠️ Pilih hari!");

    let inputs =
    document.querySelectorAll(".list input");

    let isi = [];

    inputs.forEach(i => {

        if (i.value) {

            let j =
            formatJam(i.value);

            i.value = j;

            isi.push(j);

        }

    });

    if (!isi.length)
        return showNotif("⚠️ Isi jam dulu!");

    let data = getJadwal();

    let lama =
    data[current] || [];

    data[current] =
    Array.from(
        new Set([...lama, ...isi])
    );

    localStorage.setItem(
        "jadwal",
        JSON.stringify(data)
    );

    load();

    showNotif("✅ Tersimpan!");

}

function sortJam(a, b) {

    let [x1, y1] =
    a.split(":").map(Number);

    let [x2, y2] =
    b.split(":").map(Number);

    return (
        (x1 * 60 + y1)
        -
        (x2 * 60 + y2)
    );

}

function load() {

    let data = getJadwal();

    let tabel =
    document.getElementById("tabel");

    if (!Object.keys(data).length) {

        tabel.innerHTML =
        "<tr><td>Belum ada jadwal</td></tr>";

        return;

    }

    let hari =
    Object.keys(data);

    let semua =
    new Set();

    hari.forEach(h =>
        data[h].forEach(j =>
            semua.add(j)
        )
    );

    let jamList =
    Array.from(semua)
    .sort(sortJam);

    let html =
    "<tr><th>Jam</th>";

    hari.forEach(h =>
        html += `<th>${h}</th>`
    );

    html += "</tr>";

    jamList.forEach(j => {

        html += `<tr><td>${j}</td>`;

        hari.forEach(h => {

            let ada =
            data[h].includes(j);

            let key =
            `${h}-${j}`;

            let val =
            getMapel(key);

            html += `

            <td>

                ${
                    ada
                    ?
                    `<input
                        class="mapel"
                        value="${val}"
                        onchange="
                        updateMapel(
                            '${key}',
                            this.value
                        )"
                    >`
                    :
                    `<span>-</span>`
                }

            </td>

            `;

        });

        html += "</tr>";

    });

    tabel.innerHTML = html;

}

function getMapel(key) {

    let d = JSON.parse(
        localStorage.getItem("mapel")
    ) || {};

    return d[key] || "";

}

function updateMapel(key, val) {

    let d = JSON.parse(
        localStorage.getItem("mapel")
    ) || {};

    d[key] = val;

    localStorage.setItem(
        "mapel",
        JSON.stringify(d)
    );

}

function reset() {

    localStorage.clear();

    location.reload();

}

function showNotif(t) {

    let n =
    document.createElement("div");

    n.className = "notif";

    n.innerText = t;

    document.body.appendChild(n);

    setTimeout(
        () => n.classList.add("show"),
        100
    );

    setTimeout(() => {

        n.classList.remove("show");

        setTimeout(
            () => n.remove(),
            300
        );

    }, 2000);

}
