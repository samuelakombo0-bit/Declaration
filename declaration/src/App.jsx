import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FiArrowLeft,
  FiArrowRight,
  FiBookOpen,
  FiCalendar,
  FiCheck,
  FiClock,
  FiCoffee,
  FiCompass,
  FiCopy,
  FiGift,
  FiHeart,
  FiHome,
  FiMail,
  FiMap,
  FiMapPin,
  FiMusic,
  FiPlus,
  FiPlay,
  FiSend,
  FiSmile,
  FiSquare,
  FiStar,
  FiSun,
  FiVolume2,
  FiVolumeX,
  FiX,
} from 'react-icons/fi'
import './App.css'

const THEMES = [
  { name: 'Nuit étoilée', bg1: '#0b0d2a', bg2: '#2a1146', pink: '#ff4d8d' },
  { name: 'Rose bonbon', bg1: '#3b0a2e', bg2: '#a3195b', pink: '#e0267a' },
  { name: 'Coucher de soleil', bg1: '#2b0f1f', bg2: '#c2410c', pink: '#e11d48' },
  { name: 'Océan', bg1: '#041b2d', bg2: '#0e5a78', pink: '#0d9488' },
  { name: 'Émeraude', bg1: '#06241a', bg2: '#0f5132', pink: '#ca8a04' },
]

const GROUPS = {
  l: {
    title: 'Où se voir ?',
    icon: FiMapPin,
    options: ['À l’école', 'À l’église', 'Au restaurant', 'Chez moi', 'À la plage', 'Dans un maquis', 'Dans un parc'],
  },
  j: { title: 'Quels jours ?', icon: FiCalendar, options: ['Lundi', 'Mercredi', 'Vendredi', 'Samedi', 'Dimanche'] },
  h: { title: 'Quels moments ?', icon: FiClock, options: ['Matin (10h)', 'Après-midi (16h)', 'Soirée (20h)'] },
  a: {
    title: 'Quelle ambiance ?',
    icon: FiStar,
    options: ['Romantique', 'Pleine de rires', 'Un repas ensemble', 'Une petite promenade'],
  },
}

const OPTION_ICONS = {
  'À l’école': FiBookOpen,
  'À l’église': FiGift,
  'Au restaurant': FiCoffee,
  'Chez moi': FiHome,
  'À la plage': FiSun,
  'Dans un maquis': FiCoffee,
  'Dans un parc': FiMap,
  Romantique: FiHeart,
  'Pleine de rires': FiSmile,
  'Un repas ensemble': FiCoffee,
  'Une petite promenade': FiCompass,
}

const DATE_DETAILS = [
  { key: 'lieu', label: 'Lieu', icon: FiMapPin },
  { key: 'jour', label: 'Date', icon: FiCalendar },
  { key: 'heure', label: 'Heure', icon: FiClock },
  { key: 'ambiance', label: 'Ambiance', icon: FiStar },
]

const STEPS = [
  { key: 'l', answer: 'lieu', question: 'Où veux-tu qu’on se voie ?' },
  { key: 'j', answer: 'jour', question: 'Quel jour ?' },
  { key: 'h', answer: 'heure', question: 'À quelle heure ?' },
  { key: 'a', answer: 'ambiance', question: 'Quel genre de rendez-vous ?' },
]

const REACTIONS = [
  'Excellent choix',
  'Je note ça avec plaisir',
  'Oh oui, ça me plaît',
  'J’ai déjà hâte',
  'Parfait, tu as bon goût',
]

const SONGS = {
  1: { bpm: 72, type: 'triangle', duration: 1.6, volume: 0.5, pattern: [0, 1, 2, 3, 2, 1, 2, 1] },
  2: { bpm: 48, type: 'sine', duration: 3.2, volume: 0.45, pattern: [0, -1, 2, -1, 3, -1, 1, -1] },
  3: { bpm: 96, type: 'triangle', duration: 0.7, volume: 0.55, pattern: [0, -1, 1, 2, -1, 3, 2, -1] },
}

const CHORDS = [
  [0, 4, 7, 12],
  [-3, 0, 4, 9],
  [-7, -3, 0, 5],
  [-5, -1, 2, 7],
]

const EMPTY_SELECTIONS = Object.fromEntries(
  Object.entries(GROUPS).map(([key, group]) => [key, [...group.options]]),
)

function encode(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value))
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decode(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
  const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))
  return JSON.parse(new TextDecoder().decode(bytes))
}

function normalizePhone(value) {
  let number = String(value || '').replace(/\D/g, '')
  if (number.startsWith('00')) number = number.slice(2)
  if (number.length === 9 && number.startsWith('0')) number = `242${number}`
  return number
}

function whatsappUrl(number, message) {
  return `https://wa.me/${normalizePhone(number)}?text=${encodeURIComponent(message)}`
}

function invitationUrl(config) {
  return `${window.location.origin}${window.location.pathname}#i${encode(config)}`
}

function DatePlan({ creator, partner, details }) {
  return (
    <article className="date-card">
      <h3><FiMail aria-hidden="true" /> Notre premier date</h3>
      <p className="date-couple">{creator} <FiHeart aria-hidden="true" /> {partner}</p>
      <dl className="date-details">
        {DATE_DETAILS.map(({ key, label, icon: Icon }) => (
          <div className="date-detail" key={key}>
            <dt><Icon aria-hidden="true" /> {label}</dt>
            <dd>{details[key]}</dd>
          </div>
        ))}
      </dl>
      <p className="date-message">J’ai hâte de te voir !</p>
    </article>
  )
}

function readInitialState() {
  try {
    const hash = window.location.hash.slice(1)
    if (hash.startsWith('i')) {
      return { screen: 'ask', config: decode(hash.slice(1)), reply: null, draft: null }
    }
    if (hash.startsWith('r')) {
      return { screen: 'reply', config: null, reply: decode(hash.slice(1)), draft: null }
    }
  } catch (error) {
    console.error('Le lien reçu est invalide.', error)
  }

  let draft = null
  try {
    draft = JSON.parse(localStorage.getItem('lovedate:dash'))
  } catch (error) {
    console.error('Le brouillon enregistré n’a pas pu être lu.', error)
  }
  return { screen: 'dashboard', config: null, reply: null, draft }
}

function makeStars() {
  return Array.from({ length: 68 }, (_, index) => ({
    left: `${(index * 37.7) % 100}%`,
    top: `${(index * 61.3) % 100}%`,
    delay: `${(index % 7) * -0.55}s`,
    duration: `${2.5 + (index % 5) * 0.45}s`,
  }))
}

function App() {
  const [initial] = useState(readInitialState)
  const [screen, setScreen] = useState(initial.screen)
  const [config, setConfig] = useState(initial.config)
  const [reply, setReply] = useState(initial.reply)
  const [form, setForm] = useState({
    creator: initial.draft?.c || '',
    partner: initial.draft?.p || '',
    gender: 'f',
    note: '',
    creatorPhone: initial.draft?.w || '',
    partnerPhone: initial.draft?.pw || '',
    music: '1',
    cardMessage: '',
    signature: '',
  })
  const [themeIndex, setThemeIndex] = useState(0)
  const [optionLists, setOptionLists] = useState(() =>
    Object.fromEntries(Object.entries(GROUPS).map(([key, group]) => [key, [...group.options]])),
  )
  const [selected, setSelected] = useState(EMPTY_SELECTIONS)
  const [customOptions, setCustomOptions] = useState({ l: '', j: '', h: '', a: '' })
  const [error, setError] = useState('')
  const [shareLink, setShareLink] = useState('')
  const [copyMessage, setCopyMessage] = useState('Copier le lien')
  const [noCount, setNoCount] = useState(0)
  const [noHidden, setNoHidden] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [stepLocked, setStepLocked] = useState(false)
  const [reaction, setReaction] = useState('')
  const [letterOpen, setLetterOpen] = useState(false)
  const [wowReady, setWowReady] = useState(false)
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [musicError, setMusicError] = useState('')
  const [hearts, setHearts] = useState([])
  const audioContext = useRef(null)
  const audioGain = useRef(null)
  const musicTimer = useRef(null)
  const musicPosition = useRef(0)
  const heartId = useRef(0)

  const activeThemeIndex = config?.t ?? reply?.t ?? themeIndex
  const activeTheme = THEMES[activeThemeIndex] || THEMES[0]
  const wantsMusic = screen === 'dashboard' ? Number(form.music) > 0 : Boolean(config?.mu)

  const setField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }))
  }

  const showScreen = (nextScreen) => {
    setScreen(nextScreen)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const addHearts = (count) => {
    const newHearts = Array.from({ length: count }, (_, index) => ({
      id: heartId.current + index,
      left: `${Math.random() * 95}%`,
      size: `${18 + Math.random() * 26}px`,
      delay: `${index * 0.075}s`,
    }))
    heartId.current += count
    setHearts((current) => [...current, ...newHearts])
    window.setTimeout(() => {
      const expired = new Set(newHearts.map((heart) => heart.id))
      setHearts((current) => current.filter((heart) => !expired.has(heart.id)))
    }, 4200)
  }

  const stopMusic = useCallback(() => {
    window.clearInterval(musicTimer.current)
    musicTimer.current = null
    setMusicPlaying(false)
  }, [])

  const startMusic = useCallback((selectedSong = 1) => {
    const track = Number(selectedSong || 1)
    const song = SONGS[track]
    if (!song) {
      stopMusic()
      return
    }

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      if (!AudioContextClass) throw new Error('Web Audio API indisponible')
      if (!audioContext.current) {
        audioContext.current = new AudioContextClass()
        audioGain.current = audioContext.current.createGain()
        audioGain.current.gain.value = 0.22
        audioGain.current.connect(audioContext.current.destination)
      }

      const context = audioContext.current
      void context.resume()
      window.clearInterval(musicTimer.current)
      musicPosition.current = 0
      const playTone = (frequency, time, duration, type, volume) => {
        const oscillator = context.createOscillator()
        const gain = context.createGain()
        oscillator.type = type
        oscillator.frequency.value = frequency
        gain.gain.setValueAtTime(0.0001, time)
        gain.gain.exponentialRampToValueAtTime(volume, time + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration)
        oscillator.connect(gain)
        gain.connect(audioGain.current)
        oscillator.start(time)
        oscillator.stop(time + duration + 0.05)
      }

      musicTimer.current = window.setInterval(() => {
        const length = song.pattern.length
        const chord = CHORDS[Math.floor(musicPosition.current / length) % CHORDS.length]
        const index = musicPosition.current % length
        const note = song.pattern[index]
        const time = context.currentTime + 0.05
        const frequency = (value) => 261.63 * 2 ** (value / 12)
        if (index === 0) playTone(frequency(chord[0] - 12), time, song.duration * 2, 'sine', 0.5)
        if (note >= 0) playTone(frequency(chord[note]), time, song.duration, song.type, song.volume * 0.6)
        musicPosition.current += 1
      }, 60000 / song.bpm / 2)

      setMusicError('')
      setMusicPlaying(true)
    } catch (audioError) {
      console.error('La musique ne peut pas être lancée.', audioError)
      setMusicError('La lecture audio est indisponible sur ce navigateur.')
      setMusicPlaying(false)
    }
  }, [stopMusic])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--bg1', activeTheme.bg1)
    root.style.setProperty('--bg2', activeTheme.bg2)
    root.style.setProperty('--pink', activeTheme.pink)
  }, [activeTheme])

  useEffect(() => {
    document.title = 'Une petite question…'
  }, [])

  useEffect(() => {
    if (screen !== 'wow') return undefined
    const timer = window.setTimeout(() => setWowReady(true), 2600)
    return () => window.clearTimeout(timer)
  }, [screen])

  useEffect(() => {
    if (screen !== 'ask' || !wantsMusic || musicPlaying) return undefined
    const startOnTouch = (event) => {
      if (!event.target.closest('.music-toggle')) startMusic(config?.mu)
    }
    document.addEventListener('pointerdown', startOnTouch, { once: true })
    return () => document.removeEventListener('pointerdown', startOnTouch)
  }, [screen, wantsMusic, musicPlaying, config, startMusic])

  useEffect(
    () => () => {
      window.clearInterval(musicTimer.current)
      if (audioContext.current && audioContext.current.state !== 'closed') {
        audioContext.current.close()
      }
    },
    [],
  )

  const toggleMusic = () => {
    if (musicPlaying) stopMusic()
    else startMusic(screen === 'dashboard' ? Number(form.music) : config?.mu)
  }

  const changeTheme = (index) => {
    setThemeIndex(index)
  }

  const toggleOption = (key, value) => {
    setSelected((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((option) => option !== value)
        : [...current[key], value],
    }))
  }

  const addCustomOption = (key) => {
    const value = customOptions[key].trim()
    if (!value) return
    setOptionLists((current) => ({
      ...current,
      [key]: current[key].includes(value) ? current[key] : [...current[key], value],
    }))
    setSelected((current) => ({
      ...current,
      [key]: current[key].includes(value) ? current[key] : [...current[key], value],
    }))
    setCustomOptions((current) => ({ ...current, [key]: '' }))
  }

  const generateLink = () => {
    const creator = form.creator.trim()
    const partner = form.partner.trim()
    if (!creator || !partner) {
      setError('Indique ton prénom et celui de ta/ton partenaire.')
      return
    }
    if (Object.values(selected).some((options) => options.length === 0)) {
      setError('Choisis au moins une option dans chaque catégorie.')
      return
    }

    const nextConfig = {
      c: creator,
      p: partner,
      g: form.gender,
      m: form.note.trim(),
      w: normalizePhone(form.creatorPhone),
      l: selected.l,
      j: selected.j,
      h: selected.h,
      a: selected.a,
      t: themeIndex,
      mu: Number(form.music),
      k: form.cardMessage.trim(),
      s: form.signature.trim() || creator,
    }
    setError(
      nextConfig.w
        ? ''
        : 'Astuce : ajoute ton numéro WhatsApp pour recevoir sa réponse directement.',
    )
    setConfig(nextConfig)
    setShareLink(invitationUrl(nextConfig))
    setCopyMessage('Copier le lien')
    try {
      localStorage.setItem(
        'lovedate:dash',
        JSON.stringify({
          c: creator,
          p: partner,
          w: nextConfig.w,
          pw: normalizePhone(form.partnerPhone),
        }),
      )
    } catch (storageError) {
      console.error('Le brouillon n’a pas pu être enregistré.', storageError)
    }
    window.setTimeout(() => document.getElementById('linkbox')?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopyMessage('Copié')
    } catch (clipboardError) {
      console.error('La copie automatique est indisponible.', clipboardError)
      const linkInput = document.getElementById('linkOut')
      linkInput?.select()
      setCopyMessage('Sélectionné, copie-le')
    }
  }

  const startInvite = (nextConfig) => {
    setConfig(nextConfig)
    setNoCount(0)
    setNoHidden(false)
    setAnswers({})
    setStepIndex(0)
    setError('')
    if (nextConfig.mu) startMusic(nextConfig.mu)
    else stopMusic()
    showScreen('ask')
  }

  const returnToDashboard = () => {
    stopMusic()
    setConfig(null)
    setReply(null)
    setThemeIndex(0)
    showScreen('dashboard')
  }

  const decline = () => {
    const messages = [
      `Tu es ${config?.g === 'm' ? 'sûr' : 'sûre'} ?`,
      'Réfléchis encore…',
      'Tu me brises le cœur là…',
      'Dernière chance…',
      'Bon… d’accord, je m’incline.',
    ]
    setError(messages[Math.min(noCount, messages.length - 1)])
    const nextCount = noCount + 1
    setNoCount(nextCount)
    if (nextCount >= 5) window.setTimeout(() => setNoHidden(true), 350)
  }

  const accept = () => {
    setWowReady(false)
    addHearts(18)
    showScreen('wow')
  }

  const beginWizard = () => {
    setAnswers({})
    setStepIndex(0)
    setStepLocked(false)
    setReaction('')
    showScreen('wizard')
  }

  const selectWizardOption = (value) => {
    if (stepLocked) return
    setStepLocked(true)
    const step = STEPS[stepIndex]
    setAnswers((current) => ({ ...current, [step.answer]: value }))
    setReaction(REACTIONS[stepIndex % REACTIONS.length])
    addHearts(6)
    window.setTimeout(() => {
      if (stepIndex + 1 < STEPS.length) {
        setStepIndex((current) => current + 1)
        setStepLocked(false)
        setReaction('')
      } else {
        showScreen('card')
      }
    }, 950)
  }

  const confirmDate = () => {
    addHearts(40)
    const nextReply = { c: config.c, p: config.p, d: answers, t: config.t || 0 }
    const link = `${window.location.origin}${window.location.pathname}#r${encode(nextReply)}`
    setReply(nextReply)
    setForm((current) => ({
      ...current,
      replyLink: link,
      replyUrl: whatsappUrl(
        config.w,
        `${config.c}, c’est OUI !\n\nLieu : ${answers.lieu}\nJour : ${answers.jour}\nHeure : ${answers.heure}\nAmbiance : ${answers.ambiance}\n\nVoir notre carte :\n${link}`,
      ),
    }))
    showScreen('done')
  }

  const backToDashboard = () => {
    stopMusic()
    setConfig(null)
    setThemeIndex(0)
    showScreen('dashboard')
  }

  const stars = makeStars()
  const invitationMessage = config
    ? `Coucou ${config.p},\nJ’ai quelque chose à te demander… Ouvre ce lien quand tu as une minute :\n${shareLink}`
    : ''

  return (
    <div className="app-shell">
      <div className="star-field" aria-hidden="true">
        {stars.map((star, index) => (
          <span
            className="star"
            key={index}
            style={{
              left: star.left,
              top: star.top,
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}
      </div>
      <div className="heart-field" aria-hidden="true">
        {hearts.map((heart) => (
          <span
            className="heart"
            key={heart.id}
            style={{
              left: heart.left,
              fontSize: heart.size,
              animationDelay: heart.delay,
            }}
          >
            <FiHeart aria-hidden="true" />
          </span>
        ))}
      </div>

      {screen === 'ask' && (
        <button className="floating-back" onClick={backToDashboard} type="button">
          <FiArrowLeft aria-hidden="true" /> Tableau de bord
        </button>
      )}
      {wantsMusic && screen !== 'dashboard' && screen !== 'reply' && (
        <button
          aria-label={musicPlaying ? 'Désactiver la musique' : 'Activer la musique'}
          className="music-toggle"
          onClick={toggleMusic}
          type="button"
        >
          {musicPlaying ? <FiVolume2 aria-hidden="true" /> : <FiVolumeX aria-hidden="true" />}
        </button>
      )}

      <main className="main-content">
        {screen === 'dashboard' && (
          <section className="screen dashboard">
            <header className="page-heading">
              <span className="eyebrow"><span className="eyebrow-dot" /> UNE PETITE ATTENTION</span>
              <div className="big"><FiMail aria-hidden="true" /></div>
              <h1>Crée ta déclaration</h1>
              <p>
                Prépare un moment rien qu’à vous, puis envoie ton invitation directement sur
                WhatsApp.
              </p>
            </header>

            <div className="panel">
              <div className="panel-heading">
                <span className="panel-icon">01</span>
                <div>
                  <h3>Vous deux</h3>
                  <p>Pour personnaliser votre invitation</p>
                </div>
              </div>
              <div className="grid2">
                <div className="field">
                  <label htmlFor="creator">Ton prénom</label>
                  <input
                    autoComplete="given-name"
                    id="creator"
                    maxLength={30}
                    onChange={(event) => setField('creator', event.target.value)}
                    placeholder="Ton prénom"
                    value={form.creator}
                  />
                </div>
                <div className="field">
                  <label htmlFor="partner">Prénom de ton/ta partenaire</label>
                  <input
                    autoComplete="off"
                    id="partner"
                    maxLength={30}
                    onChange={(event) => setField('partner', event.target.value)}
                    placeholder="Son prénom"
                    value={form.partner}
                  />
                </div>
                <div className="field">
                  <label htmlFor="gender">Tu t’adresses à…</label>
                  <select
                    id="gender"
                    onChange={(event) => setField('gender', event.target.value)}
                    value={form.gender}
                  >
                    <option value="f">Une fille (sûre)</option>
                    <option value="m">Un garçon (sûr)</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="note">Petit mot perso <span>(facultatif)</span></label>
                  <input
                    id="note"
                    maxLength={80}
                    onChange={(event) => setField('note', event.target.value)}
                    placeholder="Ex. : Depuis le temps…"
                    value={form.note}
                  />
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-heading">
                <span className="panel-icon">02</span>
                <div>
                  <h3>WhatsApp</h3>
                  <p>Pour vous retrouver après sa réponse</p>
                </div>
              </div>
              <div className="grid2">
                <div className="field">
                  <label htmlFor="creatorPhone">Ton numéro <span>(pour recevoir sa réponse)</span></label>
                  <input
                    autoComplete="tel"
                    id="creatorPhone"
                    inputMode="tel"
                    onChange={(event) => setField('creatorPhone', event.target.value)}
                    placeholder="ex. 06 123 4567"
                    type="tel"
                    value={form.creatorPhone}
                  />
                </div>
                <div className="field">
                  <label htmlFor="partnerPhone">Son numéro <span>(facultatif)</span></label>
                  <input
                    autoComplete="off"
                    id="partnerPhone"
                    inputMode="tel"
                    onChange={(event) => setField('partnerPhone', event.target.value)}
                    placeholder="ex. 05 123 4567"
                    type="tel"
                    value={form.partnerPhone}
                  />
                </div>
              </div>
              <p className="hint">
                Congo-Brazzaville : écris le numéro normalement, le +242 est ajouté tout seul. Sans
                son numéro, tu pourras choisir le contact dans WhatsApp.
              </p>
            </div>

            <div className="panel">
              <div className="panel-heading">
                <span className="panel-icon"><FiMusic aria-hidden="true" /></span>
                <div>
                  <h3>Style et ambiance</h3>
                  <p>Choisis les couleurs et la bande-son</p>
                </div>
              </div>
              <div className="field">
                <span className="field-label">Couleurs</span>
                <div className="chips">
                  {THEMES.map((theme, index) => (
                    <button
                      aria-pressed={themeIndex === index}
                      className={`chip theme-chip ${themeIndex === index ? 'on' : ''}`}
                      key={theme.name}
                      onClick={() => changeTheme(index)}
                      type="button"
                    >
                      <span
                        aria-hidden="true"
                        className="swatch"
                        style={{ background: `linear-gradient(135deg, ${theme.bg2}, ${theme.pink})` }}
                      />
                      {theme.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label htmlFor="music">Musique de fond</label>
                <div className="inline-controls">
                  <select
                    id="music"
                    onChange={(event) => {
                      setField('music', event.target.value)
                      if (musicPlaying) {
                        if (event.target.value === '0') stopMusic()
                        else startMusic(Number(event.target.value))
                      }
                    }}
                    value={form.music}
                  >
                    <option value="0">Sans musique</option>
                    <option value="1">Douce (piano)</option>
                    <option value="2">Rêveuse (nappes)</option>
                    <option value="3">Légère et rythmée</option>
                  </select>
                  <button
                    className="ghost listen-button"
                    onClick={() => {
                      if (musicPlaying) stopMusic()
                      else if (Number(form.music)) startMusic(Number(form.music))
                    }}
                    type="button"
                  >
                    {musicPlaying ? <><FiSquare aria-hidden="true" /> Stop</> : <><FiPlay aria-hidden="true" /> Écouter</>}
                  </button>
                </div>
                <p className="hint">Musique créée par la page, libre de droits. Elle démarre au premier toucher.</p>
                {musicError && <p className="error-text" role="status">{musicError}</p>}
              </div>
            </div>

            <div className="panel">
              <div className="panel-heading">
                <span className="panel-icon">04</span>
                <div>
                  <h3>Petite carte</h3>
                  <p>Un message qu’elle ou il découvrira dans une enveloppe</p>
                </div>
              </div>
              <div className="field">
                <label htmlFor="cardMessage">Ton message <span>(facultatif)</span></label>
                <textarea
                  id="cardMessage"
                  maxLength={300}
                  onChange={(event) => setField('cardMessage', event.target.value)}
                  placeholder="Écris ce que tu ressens…"
                  value={form.cardMessage}
                />
              </div>
              <div className="field signature-field">
                <label htmlFor="signature">Signature</label>
                <input
                  id="signature"
                  maxLength={30}
                  onChange={(event) => setField('signature', event.target.value)}
                  placeholder="Ex. : Ton admirateur secret"
                  value={form.signature}
                />
              </div>
            </div>

            {Object.entries(GROUPS).map(([key, group], index) => (
              <div className="panel" key={key}>
                <div className="panel-heading">
                  <span className="panel-icon">{String(index + 5).padStart(2, '0')}</span>
                  <div>
                    <h3><group.icon aria-hidden="true" className="heading-icon" /> {group.title}</h3>
                    <p>Les options que ton/ta partenaire pourra choisir</p>
                  </div>
                </div>
                <div className="chips">
                  {optionLists[key].map((option) => (
                    <button
                      aria-pressed={selected[key].includes(option)}
                      className={`chip ${selected[key].includes(option) ? 'on' : ''}`}
                      key={option}
                      onClick={() => toggleOption(key, option)}
                      type="button"
                    >
                      {(() => {
                        const OptionIcon = OPTION_ICONS[option] || group.icon
                        return <OptionIcon aria-hidden="true" />
                      })()}
                      {option}
                    </button>
                  ))}
                </div>
                <form
                  className="inline-controls add-option"
                  onSubmit={(event) => {
                    event.preventDefault()
                    addCustomOption(key)
                  }}
                >
                  <input
                    aria-label={`Ajouter une option : ${group.title}`}
                    maxLength={40}
                    onChange={(event) =>
                      setCustomOptions((current) => ({ ...current, [key]: event.target.value }))
                    }
                    placeholder="Ajouter ma propre option…"
                    value={customOptions[key]}
                  />
                  <button
                    aria-label={`Ajouter l’option à ${group.title}`}
                    className="ghost add-button"
                    type="submit"
                  >
                    <FiPlus aria-hidden="true" />
                  </button>
                </form>
              </div>
            ))}

            {error && <p className="form-message" role="status">{error}</p>}
            <button className="go generate-button" onClick={generateLink} type="button">
              <FiStar aria-hidden="true" /> Générer mon lien
            </button>

            {shareLink && (
              <div className="panel link-panel" id="linkbox">
                <div className="panel-heading">
                  <span className="panel-icon"><FiCheck aria-hidden="true" /></span>
                  <div>
                    <h3>Ton lien est prêt</h3>
                    <p>Envoie-lui l’invitation, ou teste-la d’abord</p>
                  </div>
                </div>
                <label className="visually-hidden" htmlFor="linkOut">Lien de l’invitation</label>
                <input id="linkOut" readOnly value={shareLink} />
                <div className="actions">
                  <a
                    className="btn wa"
                    href={whatsappUrl(form.partnerPhone, invitationMessage)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <FiSend aria-hidden="true" /> Envoyer sur WhatsApp
                  </a>
                  <button className="ghost" onClick={copyLink} type="button">
                    {copyMessage === 'Copié' ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
                    {copyMessage}
                  </button>
                  <button
                    className="ghost"
                    onClick={() => startInvite(config)}
                    type="button"
                  >
                    <FiPlay aria-hidden="true" /> Tester
                  </button>
                </div>
                <p className="hint">
                  Quand elle/il confirme, tu reçois un message WhatsApp avec le récapitulatif et un
                  lien vers la carte de confirmation.
                </p>
              </div>
            )}
          </section>
        )}

        {screen === 'ask' && config && (
          <section className="screen celebration-card">
            <div className="big"><FiMail aria-hidden="true" /></div>
            <span className="eyebrow">J’AI UNE QUESTION POUR TOI</span>
            <h1>{config.p}, j’ai quelque chose à te demander…</h1>
            <p>{config.m || ' '}</p>
            <p className="ask-question">Est-ce que tu voudrais sortir avec moi ? <FiHeart aria-hidden="true" /></p>
            <div className="choice-row">
              <button className="yes" onClick={accept} type="button"><FiCheck aria-hidden="true" /> Oui !</button>
              {!noHidden && (
                <button
                  className="no"
                  onClick={decline}
                  style={{
                    transform: `scale(${Math.max(0, 1 - noCount * 0.2)})`,
                    opacity: Math.max(0.35, 1 - noCount * 0.12),
                  }}
                  type="button"
                >
                  <FiX aria-hidden="true" /> Non
                </button>
              )}
            </div>
            <div aria-live="polite" className="response-message">{error}</div>
          </section>
        )}

        {screen === 'wow' && config && (
          <section className="screen celebration-card">
            <div className="big"><FiHeart aria-hidden="true" /></div>
            <span className="eyebrow">JE N’EN REVIENS PAS</span>
            <h1>TU AS VRAIMENT DIT OUI ?</h1>
            <p>{wowReady ? 'Attends… je dois vérifier que je ne rêve pas.' : ' '}</p>
            {wowReady && (
              <button
                className="go"
                onClick={() => {
                  if (config.k) {
                    setLetterOpen(false)
                    showScreen('letter')
                  } else {
                    beginWizard()
                  }
                }}
                type="button"
              >
                {config.k ? <><FiMail aria-hidden="true" /> Ouvrir ma petite carte</> : <>Organisons notre premier date <FiHeart aria-hidden="true" /></>}
              </button>
            )}
          </section>
        )}

        {screen === 'letter' && config && (
          <section className="screen celebration-card">
            {!letterOpen ? (
              <>
                <span className="eyebrow">UN PETIT MOT POUR TOI</span>
                <p className="letter-intro">J’ai une petite carte pour toi… touche l’enveloppe</p>
                <button
                  aria-label="Ouvrir l’enveloppe"
                  className="envelope"
                  onClick={() => {
                    setLetterOpen(true)
                    addHearts(25)
                  }}
                  type="button"
                >
                  <FiMail aria-hidden="true" />
                </button>
              </>
            ) : (
              <>
                <article className="letter">
                  <p>{config.k}</p>
                  <div className="letter-signature">— {config.s || config.c}</div>
                </article>
                <button className="go" onClick={beginWizard} type="button">
                  Organisons notre premier date <FiHeart aria-hidden="true" />
                </button>
              </>
            )}
          </section>
        )}

        {screen === 'wizard' && config && (
          <section className="screen wizard-card">
            <div aria-label={`Étape ${stepIndex + 1} sur ${STEPS.length}`} className="step-dots">
              {STEPS.map((step, index) => (
                <span
                  aria-current={index === stepIndex ? 'step' : undefined}
                  className={index <= stepIndex ? 'active' : ''}
                  key={step.key}
                />
              ))}
            </div>
            <span className="eyebrow">ON ORGANISE NOTRE RENDEZ-VOUS</span>
            <h2>{STEPS[stepIndex].question}</h2>
            <div className="option-list">
              {(config[STEPS[stepIndex].key] || []).map((option) => (
                <button
                  className="option-button"
                  disabled={stepLocked}
                  key={option}
                  onClick={() => selectWizardOption(option)}
                  type="button"
                >
                  {(() => {
                    const OptionIcon = OPTION_ICONS[option]
                    return OptionIcon ? <OptionIcon aria-hidden="true" /> : null
                  })()}
                  {option}<FiArrowRight aria-hidden="true" />
                </button>
              ))}
            </div>
            <p aria-live="polite" className="reaction">{reaction && <FiHeart aria-hidden="true" />}{reaction}</p>
          </section>
        )}

        {screen === 'card' && config && (
          <section className="screen celebration-card">
            <span className="eyebrow">C’EST LE DÉBUT DE QUELQUE CHOSE</span>
            <h2>Voilà le plan !</h2>
            <DatePlan creator={config.c} details={answers} partner={config.p} />
            <button className="yes confirm-button" onClick={confirmDate} type="button">
              <FiCheck aria-hidden="true" /> Confirmer le rendez-vous
            </button>
          </section>
        )}

        {screen === 'done' && config && (
          <section className="screen celebration-card">
            <div className="big"><FiHeart aria-hidden="true" /></div>
            <span className="eyebrow">DERNIÈRE ÉTAPE</span>
            <h1>C’est presque fini !</h1>
            <p>
              Envoie ta réponse à {config.c} pour confirmer votre rendez-vous et partager votre
              petite carte.
            </p>
            <a className="btn wa" href={form.replyUrl} rel="noreferrer" target="_blank">
              Envoyer ma réponse sur WhatsApp
            </a>
          </section>
        )}

        {screen === 'reply' && reply && (
          <section className="screen celebration-card">
            <div className="big"><FiGift aria-hidden="true" /></div>
            <span className="eyebrow">UNE BELLE NOUVELLE</span>
            <h1>{reply.p} a dit OUI !</h1>
            <p>Voici votre premier rendez-vous :</p>
            <DatePlan creator={reply.c} details={reply.d} partner={reply.p} />
            <button className="ghost new-invitation" onClick={returnToDashboard} type="button">
              Créer une autre invitation
            </button>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
