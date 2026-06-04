// ข้อมูล FIFA World Cup 2026 — 48 ทีม 12 กลุ่ม (ข้อมูลจริง)
export const WC_GROUPS = {
  A: ['Mexico', 'South Africa', 'South Korea', 'Czechia'],
  B: ['Canada', 'Bosnia and Herzegovina', 'Qatar', 'Switzerland'],
  C: ['Brazil', 'Morocco', 'Haiti', 'Scotland'],
  D: ['United States', 'Paraguay', 'Australia', 'Türkiye'],
  E: ['Germany', 'Curaçao', 'Ivory Coast', 'Ecuador'],
  F: ['Netherlands', 'Japan', 'Sweden', 'Tunisia'],
  G: ['Belgium', 'Egypt', 'Iran', 'New Zealand'],
  H: ['Spain', 'Cape Verde', 'Saudi Arabia', 'Uruguay'],
  I: ['France', 'Senegal', 'Iraq', 'Norway'],
  J: ['Argentina', 'Algeria', 'Austria', 'Jordan'],
  K: ['Portugal', 'DR Congo', 'Uzbekistan', 'Colombia'],
  L: ['England', 'Croatia', 'Ghana', 'Panama'],
}

export const TEAM_FLAGS = {
  // Group A
  Mexico: '🇲🇽', 'South Africa': '🇿🇦', 'South Korea': '🇰🇷', Czechia: '🇨🇿',
  // Group B
  Canada: '🇨🇦', 'Bosnia and Herzegovina': '🇧🇦', Qatar: '🇶🇦', Switzerland: '🇨🇭',
  // Group C
  Brazil: '🇧🇷', Morocco: '🇲🇦', Haiti: '🇭🇹', Scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  // Group D
  'United States': '🇺🇸', Paraguay: '🇵🇾', Australia: '🇦🇺', 'Türkiye': '🇹🇷',
  // Group E
  Germany: '🇩🇪', 'Curaçao': '🇨🇼', 'Ivory Coast': '🇨🇮', Ecuador: '🇪🇨',
  // Group F
  Netherlands: '🇳🇱', Japan: '🇯🇵', Sweden: '🇸🇪', Tunisia: '🇹🇳',
  // Group G
  Belgium: '🇧🇪', Egypt: '🇪🇬', Iran: '🇮🇷', 'New Zealand': '🇳🇿',
  // Group H
  Spain: '🇪🇸', 'Cape Verde': '🇨🇻', 'Saudi Arabia': '🇸🇦', Uruguay: '🇺🇾',
  // Group I
  France: '🇫🇷', Senegal: '🇸🇳', Iraq: '🇮🇶', Norway: '🇳🇴',
  // Group J
  Argentina: '🇦🇷', Algeria: '🇩🇿', Austria: '🇦🇹', Jordan: '🇯🇴',
  // Group K
  Portugal: '🇵🇹', 'DR Congo': '🇨🇩', Uzbekistan: '🇺🇿', Colombia: '🇨🇴',
  // Group L
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', Croatia: '🇭🇷', Ghana: '🇬🇭', Panama: '🇵🇦',
}

export const TEAM_COLORS = {
  Brazil: { bg: 'from-yellow-600 to-yellow-800', text: 'text-yellow-300' },
  Argentina: { bg: 'from-sky-600 to-sky-800', text: 'text-sky-300' },
  France: { bg: 'from-blue-700 to-blue-900', text: 'text-blue-300' },
  Germany: { bg: 'from-zinc-600 to-zinc-800', text: 'text-zinc-300' },
  Spain: { bg: 'from-red-700 to-red-900', text: 'text-red-300' },
  England: { bg: 'from-red-600 to-red-800', text: 'text-red-300' },
  Portugal: { bg: 'from-red-700 to-green-900', text: 'text-red-300' },
  Netherlands: { bg: 'from-orange-600 to-orange-800', text: 'text-orange-300' },
  Belgium: { bg: 'from-red-700 to-yellow-700', text: 'text-yellow-300' },
  Croatia: { bg: 'from-red-600 to-zinc-700', text: 'text-red-300' },
  Mexico: { bg: 'from-green-700 to-red-800', text: 'text-green-300' },
  'United States': { bg: 'from-blue-800 to-red-800', text: 'text-blue-300' },
  Canada: { bg: 'from-red-700 to-red-900', text: 'text-red-300' },
  Japan: { bg: 'from-red-600 to-zinc-800', text: 'text-red-300' },
  Morocco: { bg: 'from-green-800 to-red-800', text: 'text-green-300' },
  Senegal: { bg: 'from-green-700 to-yellow-700', text: 'text-green-300' },
  Uruguay: { bg: 'from-sky-700 to-sky-900', text: 'text-sky-300' },
  Colombia: { bg: 'from-yellow-600 to-blue-800', text: 'text-yellow-300' },
  default: { bg: 'from-zinc-700 to-zinc-900', text: 'text-zinc-300' },
}

export const TEAM_SQUADS = {
  Brazil: {
    formation: '4-3-3',
    players: [
      { name: 'Alisson', pos: 'GK', number: 1 },
      { name: 'Danilo', pos: 'RB', number: 2 },
      { name: 'Marquinhos', pos: 'CB', number: 4 },
      { name: 'Gabriel Magalhaes', pos: 'CB', number: 3 },
      { name: 'Alex Telles', pos: 'LB', number: 6 },
      { name: 'Casemiro', pos: 'CM', number: 5 },
      { name: 'Paquetá', pos: 'CM', number: 10 },
      { name: 'Gerson', pos: 'CM', number: 8 },
      { name: 'Rodrygo', pos: 'RW', number: 11 },
      { name: 'Vinicius Jr.', pos: 'LW', number: 20 },
      { name: 'Endrick', pos: 'ST', number: 9 },
    ],
  },
  Argentina: {
    formation: '4-3-3',
    players: [
      { name: 'E. Martínez', pos: 'GK', number: 23 },
      { name: 'Molina', pos: 'RB', number: 26 },
      { name: 'Romero', pos: 'CB', number: 13 },
      { name: 'Otamendi', pos: 'CB', number: 19 },
      { name: 'Acuña', pos: 'LB', number: 8 },
      { name: 'De Paul', pos: 'CM', number: 7 },
      { name: 'Mac Allister', pos: 'CM', number: 20 },
      { name: 'Fernández', pos: 'CM', number: 24 },
      { name: 'Di María', pos: 'RW', number: 11 },
      { name: 'Messi', pos: 'LW', number: 10 },
      { name: 'Álvarez', pos: 'ST', number: 9 },
    ],
  },
  France: {
    formation: '4-2-3-1',
    players: [
      { name: 'Maignan', pos: 'GK', number: 1 },
      { name: 'Kounde', pos: 'RB', number: 2 },
      { name: 'Upamecano', pos: 'CB', number: 5 },
      { name: 'Saliba', pos: 'CB', number: 4 },
      { name: 'T. Hernández', pos: 'LB', number: 22 },
      { name: 'Tchouaméni', pos: 'DM', number: 8 },
      { name: 'Camavinga', pos: 'DM', number: 14 },
      { name: 'Dembélé', pos: 'RW', number: 11 },
      { name: 'Griezmann', pos: 'AM', number: 7 },
      { name: 'Mbappé', pos: 'LW', number: 10 },
      { name: 'Giroud', pos: 'ST', number: 9 },
    ],
  },
  England: {
    formation: '4-3-3',
    players: [
      { name: 'Pickford', pos: 'GK', number: 1 },
      { name: 'Alexander-Arnold', pos: 'RB', number: 12 },
      { name: 'Guehi', pos: 'CB', number: 6 },
      { name: 'Stones', pos: 'CB', number: 5 },
      { name: 'Trippier', pos: 'LB', number: 3 },
      { name: 'Rice', pos: 'CM', number: 4 },
      { name: 'Bellingham', pos: 'CM', number: 22 },
      { name: 'Mainoo', pos: 'CM', number: 26 },
      { name: 'Saka', pos: 'RW', number: 17 },
      { name: 'Gordon', pos: 'LW', number: 10 },
      { name: 'Kane', pos: 'ST', number: 9 },
    ],
  },
  Germany: {
    formation: '4-2-3-1',
    players: [
      { name: 'Ter Stegen', pos: 'GK', number: 1 },
      { name: 'Kimmich', pos: 'RB', number: 6 },
      { name: 'Rüdiger', pos: 'CB', number: 2 },
      { name: 'Tah', pos: 'CB', number: 15 },
      { name: 'Mittelstädt', pos: 'LB', number: 5 },
      { name: 'Andrich', pos: 'DM', number: 23 },
      { name: 'Kroos', pos: 'DM', number: 8 },
      { name: 'Gnabry', pos: 'RW', number: 10 },
      { name: 'Musiala', pos: 'AM', number: 14 },
      { name: 'Wirtz', pos: 'LW', number: 17 },
      { name: 'Havertz', pos: 'ST', number: 7 },
    ],
  },
  Spain: {
    formation: '4-3-3',
    players: [
      { name: 'Raya', pos: 'GK', number: 23 },
      { name: 'Carvajal', pos: 'RB', number: 2 },
      { name: 'Le Normand', pos: 'CB', number: 4 },
      { name: 'Laporte', pos: 'CB', number: 14 },
      { name: 'Cucurella', pos: 'LB', number: 18 },
      { name: 'Rodri', pos: 'CM', number: 16 },
      { name: 'Pedri', pos: 'CM', number: 26 },
      { name: 'Gavi', pos: 'CM', number: 9 },
      { name: 'Yamal', pos: 'RW', number: 19 },
      { name: 'Morata', pos: 'ST', number: 7 },
      { name: 'Nico Williams', pos: 'LW', number: 21 },
    ],
  },
  Portugal: {
    formation: '4-3-3',
    players: [
      { name: 'Costa', pos: 'GK', number: 1 },
      { name: 'Cancelo', pos: 'RB', number: 20 },
      { name: 'Pepe', pos: 'CB', number: 3 },
      { name: 'Rúben Dias', pos: 'CB', number: 6 },
      { name: 'Mendes', pos: 'LB', number: 5 },
      { name: 'W. Carvalho', pos: 'CM', number: 14 },
      { name: 'Bruno Fernandes', pos: 'CM', number: 8 },
      { name: 'Vitinha', pos: 'CM', number: 16 },
      { name: 'B. Silva', pos: 'RW', number: 10 },
      { name: 'Ronaldo', pos: 'ST', number: 7 },
      { name: 'Rafael Leão', pos: 'LW', number: 17 },
    ],
  },
  Netherlands: {
    formation: '4-3-3',
    players: [
      { name: 'Flekken', pos: 'GK', number: 1 },
      { name: 'Dumfries', pos: 'RB', number: 22 },
      { name: 'De Ligt', pos: 'CB', number: 4 },
      { name: 'Van Dijk', pos: 'CB', number: 3 },
      { name: 'Timber', pos: 'LB', number: 12 },
      { name: 'De Jong', pos: 'CM', number: 21 },
      { name: 'Koopmeiners', pos: 'CM', number: 6 },
      { name: 'Schouten', pos: 'CM', number: 14 },
      { name: 'Bergwijn', pos: 'RW', number: 7 },
      { name: 'Gakpo', pos: 'ST', number: 11 },
      { name: 'Depay', pos: 'LW', number: 10 },
    ],
  },
  Japan: {
    formation: '4-2-3-1',
    players: [
      { name: 'Suzuki', pos: 'GK', number: 1 },
      { name: 'Yamane', pos: 'RB', number: 2 },
      { name: 'Itakura', pos: 'CB', number: 3 },
      { name: 'Yoshida', pos: 'CB', number: 22 },
      { name: 'Nagatomo', pos: 'LB', number: 5 },
      { name: 'Endo', pos: 'DM', number: 17 },
      { name: 'Morita', pos: 'DM', number: 6 },
      { name: 'Doan', pos: 'RW', number: 8 },
      { name: 'Kamada', pos: 'AM', number: 10 },
      { name: 'Mitoma', pos: 'LW', number: 11 },
      { name: 'Ueda', pos: 'ST', number: 9 },
    ],
  },
  Morocco: {
    formation: '4-3-3',
    players: [
      { name: 'Bono', pos: 'GK', number: 1 },
      { name: 'Hakimi', pos: 'RB', number: 2 },
      { name: 'Aguerd', pos: 'CB', number: 5 },
      { name: 'Saiss', pos: 'CB', number: 6 },
      { name: 'Mazraoui', pos: 'LB', number: 3 },
      { name: 'Ounahi', pos: 'CM', number: 8 },
      { name: 'Amrabat', pos: 'CM', number: 4 },
      { name: 'Ziyech', pos: 'CM', number: 7 },
      { name: 'En-Nesyri', pos: 'RW', number: 19 },
      { name: 'Sabiri', pos: 'ST', number: 14 },
      { name: 'Boufal', pos: 'LW', number: 11 },
    ],
  },
  Colombia: {
    formation: '4-3-3',
    players: [
      { name: 'Vargas', pos: 'GK', number: 1 },
      { name: 'Muñoz', pos: 'RB', number: 2 },
      { name: 'Lucumí', pos: 'CB', number: 4 },
      { name: 'Sánchez', pos: 'CB', number: 3 },
      { name: 'Mojica', pos: 'LB', number: 17 },
      { name: 'Lerma', pos: 'CM', number: 8 },
      { name: 'Mateus Uribe', pos: 'CM', number: 13 },
      { name: 'Arias', pos: 'CM', number: 16 },
      { name: 'Cuadrado', pos: 'RW', number: 11 },
      { name: 'Falcao', pos: 'ST', number: 9 },
      { name: 'Díaz', pos: 'LW', number: 7 },
    ],
  },
}

export const getSquad = (teamName) => {
  return TEAM_SQUADS[teamName] || {
    formation: '4-4-2',
    players: [
      { name: 'Goalkeeper', pos: 'GK', number: 1 },
      { name: 'Right Back', pos: 'RB', number: 2 },
      { name: 'Centre Back', pos: 'CB', number: 4 },
      { name: 'Centre Back', pos: 'CB', number: 5 },
      { name: 'Left Back', pos: 'LB', number: 3 },
      { name: 'Right Mid', pos: 'RM', number: 7 },
      { name: 'Centre Mid', pos: 'CM', number: 8 },
      { name: 'Centre Mid', pos: 'CM', number: 6 },
      { name: 'Left Mid', pos: 'LM', number: 11 },
      { name: 'Striker', pos: 'ST', number: 9 },
      { name: 'Striker', pos: 'ST', number: 10 },
    ],
  }
}

export const POSITION_COORDS = {
  GK:  { x: 50, y: 88 },
  RB:  { x: 80, y: 72 }, CB:  { x: 62, y: 72 },
  LB:  { x: 20, y: 72 }, RWB: { x: 85, y: 58 }, LWB: { x: 15, y: 58 },
  DM:  { x: 50, y: 57 },
  RM:  { x: 80, y: 45 }, CM:  { x: 50, y: 48 }, LM: { x: 20, y: 45 },
  AM:  { x: 50, y: 35 },
  RW:  { x: 78, y: 28 }, ST:  { x: 50, y: 20 }, LW: { x: 22, y: 28 },
}

export function getPlayerCoord(players, idx) {
  const player = players[idx]
  const base = POSITION_COORDS[player.pos] || { x: 50, y: 50 }
  const samePosPlayers = players.filter((p, i) => p.pos === player.pos)
  const posIdx = samePosPlayers.findIndex((p, i) => players.indexOf(p) === idx || (p.name === player.name && players.slice(0, idx).filter(pp => pp.pos === player.pos).length === i))
  const total = samePosPlayers.length
  const offset = total > 1 ? (posIdx - (total - 1) / 2) * 14 : 0
  return { x: base.x + offset, y: base.y }
}
