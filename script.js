const hariList = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"];

let temp = {};
let current = null;

// ================= INIT =================
init();
function init(){
    let hariDiv = document.getElementById("hari");

    hariList.forEach(h=>{
        let btn = document.createElement("div");
        btn.innerText = h;
        btn.className = "hari-btn";
        btn.onclick = ()=>pilihHari(btn,h);
        hariDiv.appendChild(btn);
    });

    load();
}

// ================= STORAGE =================
function getJadwal(){
    return JSON.parse(localStorage.getItem("jadwal")) || {};
}

// ================= PILIH HARI =================
function pilihHari(btn,hari){

    if(current){
        let inputs=document.querySelectorAll(".list input");
        temp[current]=[];

        inputs.forEach(i=>{
            if(i.value) temp[current].push(formatJam(i.value));
        });
    }

    document.querySelectorAll(".hari-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");

    current=hari;

    let jamDiv=document.getElementById("jam");
    jamDiv.innerHTML="";

    let box=document.createElement("div");
    box.className="jam-box";

    box.innerHTML=`
        <h4>${hari}</h4>
        <div class="list"></div>
        <button onclick="tambah()">+ Jam</button>
        <button onclick="copyHari()">📋 Copy di setiap hari?</button>
        <button onclick="batalHari()" style="background:#888;">Batal</button>
    `;

    jamDiv.appendChild(box);

    let list = box.querySelector(".list");

    let data = getJadwal();

    let gabung = new Set([
        ...(data[hari] || []),
        ...(temp[hari] || [])
    ]);

    Array.from(gabung).forEach(j=>{
        let input=document.createElement("input");
        input.value=j;
        list.appendChild(input);
    });
}

// ================= TAMBAH JAM =================
function tambah(){
    let list=document.querySelector(".list");
    let input=document.createElement("input");
    input.placeholder="Contoh: 8 / 800 / 845";
    list.appendChild(input);
}

// ================= FORMAT JAM =================
function formatJam(input){
    input = input.replace(/[^0-9]/g, "");

    if(input.length === 1) return "0" + input + ":00";
    if(input.length === 2) return input + ":00";
    if(input.length === 3) return "0" + input[0] + ":" + input.slice(1);
    if(input.length === 4) return input.slice(0,2) + ":" + input.slice(2);

    return input;
}

// ================= COPY =================
function copyHari(){

    if(!current){
        showNotif("⚠️ Pilih hari dulu!");
        return;
    }

    let inputs = document.querySelectorAll(".list input");
    let isi = [];

    inputs.forEach(i=>{
        if(i.value){
            let jamFix = formatJam(i.value);
            i.value = jamFix;
            isi.push(jamFix);
        }
    });

    if(isi.length === 0){
        showNotif("⚠️ Tidak ada jam!");
        return;
    }

    // 🔥 SIMPAN hari asal dulu
    let data = getJadwal();
    let lama = data[current] || [];
    let gabung = new Set([...lama, ...isi]);
    data[current] = Array.from(gabung);
    localStorage.setItem("jadwal", JSON.stringify(data));

    showCopyPopup(isi);
}

// ================= POPUP =================
function showCopyPopup(jamList){

    let popup = document.createElement("div");
    popup.className = "popup";

    popup.innerHTML = `
        <div class="popup-box">
            <h3>Copy ke semua hari?</h3>
            <p>Tambahkan juga ke:</p>

            <label><input type="checkbox" value="Sabtu"> Sabtu</label><br>
            <label><input type="checkbox" value="Minggu"> Minggu</label><br><br>

            <button onclick="prosesCopy()">Copy</button>
            <button onclick="tutupPopup()">Batal</button>
        </div>
    `;

    document.body.appendChild(popup);

    window._copyData = jamList;
}

// ================= PROSES COPY =================
function prosesCopy(){
    let data = getJadwal();

    // default: hari kerja saja
    let targetHari = hariList.filter(h => 
        h !== current && h !== "Sabtu" && h !== "Minggu"
    );

    // tambahan checklist
    let checked = document.querySelectorAll(".popup input:checked");
    checked.forEach(c=>{
        targetHari.push(c.value);
    });

    targetHari.forEach(h=>{
        let lama = data[h] || [];
        let gabung = new Set([...lama, ...window._copyData]);
        data[h] = Array.from(gabung);
    });

    localStorage.setItem("jadwal", JSON.stringify(data));

    tutupPopup();
    load();

    showNotif("✅ Copy berhasil!");
}

// ================= TUTUP =================
function tutupPopup(){
    document.querySelector(".popup").remove();
}

// ================= BATAL =================
function batalHari(){
    if(!current) return;

    delete temp[current];
    current = null;

    document.querySelectorAll(".hari-btn").forEach(b=>b.classList.remove("active"));
    document.getElementById("jam").innerHTML="";

    showNotif("❌ Input dibatalkan");
}

// ================= SIMPAN =================
function simpan(){

    if(!current){
        showNotif("⚠️ Pilih hari dulu!");
        return;
    }

    let inputs=document.querySelectorAll(".list input");
    let isi = [];

    inputs.forEach(i=>{
        if(i.value){
            let jamFix = formatJam(i.value);
            i.value = jamFix;
            isi.push(jamFix);
        }
    });

    if(isi.length === 0){
        showNotif("⚠️ Jam harus diisi!");
        return;
    }

    let data = getJadwal();

    let lama = data[current] || [];
    let gabung = new Set([...lama, ...isi]);

    data[current] = Array.from(gabung);

    localStorage.setItem("jadwal", JSON.stringify(data));

    load();

    showNotif("✅ Jadwal diupdate!");
}

// ================= SORT =================
function sortJam(a,b){
    let [h1,m1] = a.split(":").map(Number);
    let [h2,m2] = b.split(":").map(Number);
    return (h1*60+m1) - (h2*60+m2);
}

// ================= LOAD =================
function load(){
    let data = getJadwal();
    let tabel = document.getElementById("tabel");

    if(Object.keys(data).length === 0){
        tabel.innerHTML="<tr><td>Belum ada jadwal</td></tr>";
        return;
    }

    let hari = Object.keys(data);

    let semuaJam = new Set();
    hari.forEach(h=>data[h].forEach(j=>semuaJam.add(j)));

    let jamList = Array.from(semuaJam).sort(sortJam);

    let html="<tr><th>Jam</th>";
    hari.forEach(h=>html+=`<th>${h}</th>`);
    html+="</tr>";

    jamList.forEach(jam=>{
        html+=`<tr><td>${jam}</td>`;

        hari.forEach(h=>{
            let ada = data[h].includes(jam);
            let key = `${h}-${jam}`;
            let value = getMapel(key);

            html+=`<td>
                ${ada ? `
                    <input class="mapel"
                        value="${value}"
                        onchange="updateMapel('${key}', this.value)">
                ` : `<span style="opacity:0.6;">-</span>`}
            </td>`;
        });

        html+="</tr>";
    });

    tabel.innerHTML = html;
}

// ================= MAPEL =================
function getMapel(key){
    let data = JSON.parse(localStorage.getItem("mapel")) || {};
    return data[key] || "";
}

function updateMapel(key, value){
    let data = JSON.parse(localStorage.getItem("mapel")) || {};
    data[key] = value;
    localStorage.setItem("mapel", JSON.stringify(data));
}

// ================= RESET =================
function reset(){
    localStorage.clear();
    location.reload();
}

// ================= NOTIF =================
function showNotif(text){
    let notif = document.createElement("div");
    notif.innerText = text;
    notif.className = "notif";

    document.body.appendChild(notif);

    setTimeout(()=>notif.classList.add("show"),100);

    setTimeout(()=>{
        notif.classList.remove("show");
        setTimeout(()=>notif.remove(),300);
    },2000);
}