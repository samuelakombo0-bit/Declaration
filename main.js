const BASE = "https://claude.ai/artifact/XxFAHvz6LGZ1NZ3wimrD9h";
const $ = id => document.getElementById(id);
const show = id => {
  document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active"));
  $(id).classList.add("active");
  window.scrollTo(0, 0);
};
const enc = value =>
  btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(value))))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
const dec = value => {
  value = value.replace(/-/g, "+").replace(/_/g, "/");
  while (value.length % 4) value += "=";
  return JSON.parse(
    new TextDecoder().decode(Uint8Array.from(atob(value), character => character.charCodeAt(0))),
  );
};
const digits = value => String(value || "").replace(/\D/g, "");
const phone = value => {
  let number = digits(value);
  if (number.startsWith("00")) number = number.slice(2);
  if (number.length === 9 && number[0] === "0") number = "242" + number;
  return number;
};
const waUrl = (number, text) =>
  "https://wa.me/" + phone(number) + "?text=" + encodeURIComponent(text);
const store = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem("lovedate:" + key));
    } catch (error) {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem("lovedate:" + key, JSON.stringify(value));
    } catch (error) {}
  },
};

// Étoiles + cœurs
for (let i = 0; i < 70; i++) {
  const star = document.createElement("div");
  star.className = "star";
  star.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-delay:${Math.random() * 3}s;animation-duration:${2 + Math.random() * 3}s`;
  document.body.appendChild(star);
}

function hearts(count) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const heart = document.createElement("div");
      heart.className = "heart";
      heart.textContent = ["❤️", "💖", "💘", "💕"][i % 4];
      heart.style.left = Math.random() * 95 + "%";
      heart.style.fontSize = 18 + Math.random() * 26 + "px";
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 3600);
    }, i * 90);
  }
}

/* ============ THÈMES + MUSIQUE ============ */
const THEMES = [
  ["Nuit étoilée", "#0b0d2a", "#2a1146", "#ff4d8d"],
  ["Rose bonbon", "#3b0a2e", "#a3195b", "#e0267a"],
  ["Coucher de soleil", "#2b0f1f", "#c2410c", "#e11d48"],
  ["Océan", "#041b2d", "#0e5a78", "#0d9488"],
  ["Émeraude", "#06241a", "#0f5132", "#ca8a04"],
];
let themeIdx = 0;

function applyTheme(index) {
  const theme = THEMES[index] || THEMES[0];
  const root = document.documentElement.style;
  root.setProperty("--bg1", theme[1]);
  root.setProperty("--bg2", theme[2]);
  root.setProperty("--pink", theme[3]);
}

function drawThemes() {
  const box = $("themes");
  box.innerHTML = "";
  THEMES.forEach((theme, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip" + (index === themeIdx ? " on" : "");
    button.innerHTML =
      '<span class="sw" style="background:linear-gradient(135deg,' +
      theme[2] +
      "," +
      theme[3] +
      ')"></span>';
    button.append(theme[0]);
    button.onclick = () => {
      themeIdx = index;
      applyTheme(index);
      drawThemes();
    };
    box.appendChild(button);
  });
}

drawThemes();

// Musique générée dans la page (Web Audio), sans fichier ni droits d’auteur
const SONGS = {
  1: { bpm: 72, type: "triangle", dur: 1.6, vol: 0.5, pat: [0, 1, 2, 3, 2, 1, 2, 1] },
  2: { bpm: 48, type: "sine", dur: 3.2, vol: 0.45, pat: [0, -1, 2, -1, 3, -1, 1, -1] },
  3: { bpm: 96, type: "triangle", dur: 0.7, vol: 0.55, pat: [0, -1, 1, 2, -1, 3, 2, -1] },
};
const CH = [
  [0, 4, 7, 12],
  [-3, 0, 4, 9],
  [-7, -3, 0, 5],
  [-5, -1, 2, 7],
];
let ac, mg, tm = null, pos = 0, song = 1, playing = false, wantMusic = false, userMuted = false;
const fq = note => 261.63 * Math.pow(2, note / 12);

function tone(frequency, time, duration, type, volume) {
  const oscillator = ac.createOscillator();
  const gain = ac.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(volume, time + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  oscillator.connect(gain);
  gain.connect(mg);
  oscillator.start(time);
  oscillator.stop(time + duration + 0.05);
}

function syncBtn() {
  $("mus").textContent = playing ? "🔊" : "🔇";
  $("prevMus").textContent = playing ? "⏹ Stop" : "▶︎ Écouter";
}

function stopMusic() {
  clearInterval(tm);
  tm = null;
  playing = false;
  syncBtn();
}

function startMusic(selectedSong) {
  try {
    if (!ac) {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      mg = ac.createGain();
      mg.gain.value = 0.22;
      mg.connect(ac.destination);
    }
    ac.resume();
    clearInterval(tm);
    song = selectedSong || song;
    const currentSong = SONGS[song];
    if (!currentSong) return stopMusic();
    pos = 0;
    tm = setInterval(() => {
      const length = currentSong.pat.length;
      const chord = CH[Math.floor(pos / length) % 4];
      const index = pos % length;
      const note = currentSong.pat[index];
      const time = ac.currentTime + 0.05;
      if (index === 0) tone(fq(chord[0] - 12), time, currentSong.dur * 2, "sine", 0.5);
      if (note >= 0) tone(fq(chord[note]), time, currentSong.dur, currentSong.type, currentSong.vol * 0.6);
      pos++;
    }, 60000 / currentSong.bpm / 2);
    playing = true;
  } catch (error) {
    playing = false;
  }
  syncBtn();
}

document.addEventListener("pointerdown", event => {
  if (wantMusic && !playing && !userMuted && !event.target.closest("#mus")) startMusic();
});

$("mus").onclick = () => {
  if (playing) {
    userMuted = true;
    stopMusic();
  } else {
    userMuted = false;
    startMusic();
  }
};

$("prevMus").onclick = () => {
  const value = +$("music").value;
  if (playing) stopMusic();
  else if (value) startMusic(value);
};

$("music").onchange = () => {
  const value = +$("music").value;
  if (playing) value ? startMusic(value) : stopMusic();
};

/* ============ TABLEAU DE BORD ============ */
const GROUPS = {
  l: ["📍 Où se voir ?", ["🏫 À l’école", "⛪ À l’église", "🍽️ Au restaurant", "🏠 Chez moi", "🌴 À la plage", "🍗 Dans un maquis", "🌳 Dans un parc"]],
  j: ["📅 Quels jours ?", ["Lundi", "Mercredi", "Vendredi", "Samedi", "Dimanche"]],
  h: ["🕒 Quels moments ?", ["Matin (10h)", "Après-midi (16h)", "Soirée (20h)"]],
  a: ["✨ Quelle ambiance ?", ["❤️ Romantique", "😂 Pleine de rires", "🍕 Un repas ensemble", "🚶 Une petite promenade"]],
};
const all = {};
const sel = {};

for (const key in GROUPS) {
  all[key] = [...GROUPS[key][1]];
  sel[key] = new Set(GROUPS[key][1]);
}

$("groups").innerHTML = Object.keys(GROUPS)
  .map(
    key =>
      `<div class="panel"><h3>${GROUPS[key][0]}</h3><div class="chips" id="g-${key}"></div><div class="add"><input id="in-${key}" maxlength="40" placeholder="Ajouter ma propre option…"><button class="ghost" data-k="${key}" type="button">＋</button></div></div>`,
  )
  .join("");

function drawChips(key) {
  const box = $("g-" + key);
  box.innerHTML = "";
  all[key].forEach(value => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip" + (sel[key].has(value) ? " on" : "");
    button.textContent = value;
    button.onclick = () => {
      sel[key].has(value) ? sel[key].delete(value) : sel[key].add(value);
      button.classList.toggle("on");
    };
    box.appendChild(button);
  });
}

for (const key in GROUPS) drawChips(key);

document.querySelectorAll(".add button").forEach(button => {
  button.onclick = () => {
    const key = button.dataset.k;
    const input = $("in-" + key);
    const value = input.value.trim();
    if (!value) return;
    if (!all[key].includes(value)) all[key].push(value);
    sel[key].add(value);
    input.value = "";
    drawChips(key);
  };
});

let lastCfg = null;

$("gen").onclick = () => {
  const creatorName = $("cName").value.trim();
  const partnerName = $("pName").value.trim();
  if (!creatorName || !partnerName) {
    return ($("err").textContent = "Indique ton prénom et celui de ta/ton partenaire.");
  }
  for (const key in sel) {
    if (!sel[key].size) {
      return ($("err").textContent = "Choisis au moins une option dans chaque catégorie.");
    }
  }
  $("err").textContent = "";
  lastCfg = {
    c: creatorName,
    p: partnerName,
    g: $("gender").value,
    m: $("msg").value.trim(),
    w: phone($("cPhone").value),
    l: [...sel.l],
    j: [...sel.j],
    h: [...sel.h],
    a: [...sel.a],
    t: themeIdx,
    mu: +$("music").value,
    k: $("cardMsg").value.trim(),
    s: $("cardSig").value.trim() || creatorName,
  };
  store.set("dash", {
    c: creatorName,
    p: partnerName,
    w: lastCfg.w,
    pw: phone($("pPhone").value),
  });
  const link = BASE + "#i" + enc(lastCfg);
  $("linkOut").value = link;
  $("waSend").href = waUrl(
    $("pPhone").value,
    `Coucou ${partnerName} 💌\nJ’ai quelque chose à te demander… Ouvre ce lien quand tu as une minute 👇\n${link}`,
  );
  $("linkbox").style.display = "block";
  if (!lastCfg.w) {
    $("err").textContent = "Astuce : ajoute ton numéro WhatsApp pour recevoir sa réponse directement.";
  }
  $("linkbox").scrollIntoView({ behavior: "smooth" });
};

$("copy").onclick = async () => {
  try {
    await navigator.clipboard.writeText($("linkOut").value);
    $("copy").textContent = "Copié ✅";
  } catch (error) {
    $("linkOut").select();
    $("copy").textContent = "Sélectionné, copie-le";
  }
};

$("test").onclick = () => {
  stopMusic();
  startInvite(lastCfg, true);
  if (lastCfg.mu) startMusic(lastCfg.mu);
};

$("back").onclick = () => {
  $("back").style.display = "none";
  stopMusic();
  wantMusic = false;
  $("mus").style.display = "none";
  applyTheme(themeIdx);
  show("s-dash");
};

$("newOne").onclick = () => show("s-dash");

/* ============ DÉCLARATION (partenaire) ============ */
let cfg, ch, si, noCount, locked;

function startInvite(config, preview) {
  cfg = config;
  ch = {};
  si = 0;
  noCount = 0;
  userMuted = false;
  applyTheme(cfg.t || 0);
  song = cfg.mu || 1;
  wantMusic = !!cfg.mu;
  $("mus").style.display = wantMusic ? "block" : "none";
  syncBtn();
  $("back").style.display = preview ? "block" : "none";
  $("askTitle").textContent = `${cfg.p}, j’ai quelque chose à te demander…`;
  $("askMsg").textContent = cfg.m || " ";
  $("nomsg").textContent = "";
  $("no").style.cssText = "";
  $("yes").style.transform = "";
  show("s-ask");
}

$("no").onclick = () => {
  const messages = [
    `Tu es ${cfg.g === "m" ? "sûr" : "sûre"} ? 🥺`,
    "Réfléchis encore…",
    "Tu me brises le cœur là 😭",
    "Dernière chance…",
    "Bon… d’accord, je m’incline 😢",
  ];
  $("nomsg").textContent = messages[Math.min(noCount, 4)];
  noCount++;
  $("no").style.transform = `scale(${Math.max(0, 1 - noCount * 0.2)})`;
  $("yes").style.transform = `scale(${1 + noCount * 0.08})`;
  if (noCount >= 5) setTimeout(() => ($("no").style.display = "none"), 350);
};

$("yes").onclick = () => {
  hearts(18);
  show("s-wow");
  $("wowtxt").textContent = "\u00a0";
  $("start").style.display = "none";
  setTimeout(
    () => ($("wowtxt").textContent = "Attends… je dois vérifier que je ne rêve pas."),
    700,
  );
  setTimeout(() => {
    $("wowtxt").textContent += " 😳";
    $("start").textContent = cfg.k ? "Ouvrir ma petite carte 💌" : "Organisons notre premier date ❤️";
    $("start").style.display = "inline-block";
  }, 2600);
};

function startWiz() {
  si = 0;
  ch = {};
  show("s-wiz");
  renderStep();
}

function openLetter() {
  $("ltxt").textContent = cfg.k;
  $("lsig").textContent = "— " + (cfg.s || cfg.c);
  $("letIntro").style.display = "block";
  $("env").style.display = "block";
  $("letter").style.display = "none";
  $("toWiz").style.display = "none";
  show("s-letter");
}

$("start").onclick = () => (cfg.k ? openLetter() : startWiz());
$("env").onclick = () => {
  $("env").style.display = "none";
  $("letIntro").style.display = "none";
  $("letter").style.display = "block";
  $("toWiz").style.display = "inline-block";
  hearts(25);
};
$("toWiz").onclick = startWiz;

const STEPS = [
  ["l", "lieu", "Où veux-tu qu’on se voie ?"],
  ["j", "jour", "Quel jour ?"],
  ["h", "heure", "À quelle heure ?"],
  ["a", "ambiance", "Quel genre de rendez-vous ?"],
];
const REACTS = [
  "Excellent choix 😍",
  "Je note ça dans mon cœur 📝",
  "Oh oui, ça me plaît ✨",
  "J’ai déjà hâte 🥰",
  "Parfait, tu as bon goût 💖",
];

function renderStep() {
  locked = false;
  $("react").textContent = "";
  const [key, answerKey, question] = STEPS[si];
  $("dots").innerHTML = STEPS.map((_, index) => `<i class="${index <= si ? "on" : ""}"></i>`).join(
    "",
  );
  $("q").textContent = question;
  $("opts").innerHTML = "";
  (cfg[key] || []).forEach(value => {
    const button = document.createElement("button");
    button.className = "opt";
    button.textContent = value;
    button.onclick = () => {
      if (locked) return;
      locked = true;
      ch[answerKey] = value;
      hearts(6);
      $("react").textContent = REACTS[Math.floor(Math.random() * REACTS.length)];
      setTimeout(() => {
        si++;
        si < STEPS.length ? renderStep() : buildCard();
      }, 950);
    };
    $("opts").appendChild(button);
  });
}

const cardText = (creator, partner, details) =>
  `💌 NOTRE PREMIER DATE\n${creator} ❤️ ${partner}\n\n📍 Lieu : ${details.lieu}\n📅 Date : ${details.jour}\n🕒 Heure : ${details.heure}\n✨ Ambiance : ${details.ambiance}\n\n« J’ai hâte de te voir ! »`;

function buildCard() {
  $("card").textContent = cardText(cfg.c, cfg.p, ch);
  show("s-card");
}

$("confirm").onclick = () => {
  hearts(40);
  const link = BASE + "#r" + enc({ c: cfg.c, p: cfg.p, d: ch, t: cfg.t || 0 });
  const text = `💚 ${cfg.c}, c’est OUI !\n\n📍 ${ch.lieu}\n📅 ${ch.jour}\n🕒 ${ch.heure}\n✨ ${ch.ambiance}\n\nVoir notre carte 👇\n${link}`;
  $("waReply").href = waUrl(cfg.w, text);
  $("doneTxt").textContent = `Dernière étape : envoie ta réponse à ${cfg.c} pour qu’il/elle sache que c’est confirmé ! 💌`;
  show("s-done");
};

/* ============ CONFIRMATION (créateur) ============ */
function showReply(reply) {
  applyTheme(reply.t);
  $("repTitle").textContent = `${reply.p} a dit OUI ! 🎉`;
  $("repCard").textContent = cardText(reply.c, reply.p, reply.d);
  $("back").style.display = "none";
  show("s-reply");
  hearts(40);
}

/* ============ DÉMARRAGE ============ */
function showDash() {
  applyTheme(themeIdx);
  const data = store.get("dash");
  if (data) {
    $("cName").value = data.c || "";
    $("pName").value = data.p || "";
    $("cPhone").value = data.w || "";
    $("pPhone").value = data.pw || "";
  }
  show("s-dash");
}

try {
  const hash = location.hash.slice(1);
  if (hash[0] === "i") startInvite(dec(hash.slice(1)), false);
  else if (hash[0] === "r") showReply(dec(hash.slice(1)));
  else showDash();
} catch (error) {
  showDash();
}
