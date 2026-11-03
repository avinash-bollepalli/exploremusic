/**
 * Tempo (BPM) buckets and the genres that typically live in each range.
 * Replaces the old single-genre-per-badge model on the home page.
 */
export const bpmBuckets = [
  {
    id: 'bpm-20-40',
    bpmRange: '20–40',
    color: '#38bdf8',
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #22d3ee 100%)',
    genres: ['Ambient', 'Drone'],
  },
  {
    id: 'bpm-40-60',
    bpmRange: '40–60',
    color: '#22d3ee',
    gradient: 'linear-gradient(135deg, #22d3ee 0%, #2dd4bf 100%)',
    genres: ['Downtempo', 'Slow Ambient'],
  },
  {
    id: 'bpm-60-75',
    bpmRange: '60–75',
    color: '#2dd4bf',
    gradient: 'linear-gradient(135deg, #2dd4bf 0%, #34d399 100%)',
    genres: ['Chillout', 'Slow Blues', 'Ballads'],
  },
  {
    id: 'bpm-70-90',
    bpmRange: '70–90',
    color: '#34d399',
    gradient: 'linear-gradient(135deg, #34d399 0%, #4ade80 100%)',
    genres: ['Hip-Hop', 'R&B', 'Trip-Hop'],
  },
  {
    id: 'bpm-80-100',
    bpmRange: '80–100',
    color: '#4ade80',
    gradient: 'linear-gradient(135deg, #4ade80 0%, #a3e635 100%)',
    genres: ['Reggae', 'Dub', 'Soul'],
  },
  {
    id: 'bpm-90-110',
    bpmRange: '90–110',
    color: '#a3e635',
    gradient: 'linear-gradient(135deg, #a3e635 0%, #facc15 100%)',
    genres: ['Deep House', 'Downtempo Electronic'],
  },
  {
    id: 'bpm-100-120',
    bpmRange: '100–120',
    color: '#facc15',
    gradient: 'linear-gradient(135deg, #facc15 0%, #fb923c 100%)',
    genres: ['Pop', 'Disco', 'Funk'],
  },
  {
    id: 'bpm-110-125',
    bpmRange: '110–125',
    color: '#fb923c',
    gradient: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
    genres: ['House', 'Tech House'],
  },
  {
    id: 'bpm-120-130',
    bpmRange: '120–130',
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316 0%, #fb7185 100%)',
    genres: ['Deep House', 'Progressive House'],
  },
  {
    id: 'bpm-125-135',
    bpmRange: '125–135',
    color: '#fb7185',
    gradient: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 100%)',
    genres: ['Techno', 'Trance'],
  },
  {
    id: 'bpm-130-145',
    bpmRange: '130–145',
    color: '#f43f5e',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #e879f9 100%)',
    genres: ['EDM', 'Hard House', 'Psytrance'],
  },
  {
    id: 'bpm-140-150',
    bpmRange: '140–150',
    color: '#e879f9',
    gradient: 'linear-gradient(135deg, #e879f9 0%, #c084fc 100%)',
    genres: ['Dubstep', 'Drum & Bass (some tracks)', 'Trap'],
  },
  {
    id: 'bpm-150-170',
    bpmRange: '150–170',
    color: '#c084fc',
    gradient: 'linear-gradient(135deg, #c084fc 0%, #a78bfa 100%)',
    genres: ['Drum & Bass', 'Jungle'],
  },
  {
    id: 'bpm-160-180',
    bpmRange: '160–180',
    color: '#a78bfa',
    gradient: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
    genres: ['Hardcore', 'Happy Hardcore'],
  },
  {
    id: 'bpm-170-200',
    bpmRange: '170–200',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #f87171 100%)',
    genres: ['Speedcore', 'Fast Punk', 'Metal'],
  },
  {
    id: 'bpm-180-220',
    bpmRange: '180–220+',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
    genres: ['Hardcore Techno', 'Speedcore'],
  },
]

export default bpmBuckets
