export const MOCK_STUDENT = {
  id: 'stu-001',
  name: 'Aryan Sharma',
  department: 'Computer Science',
  year: 2,
  skills: ['Python', 'React', 'Machine Learning'],
  interests: ['AI', 'Music', 'Photography', 'Startups'],
  time_budget_minutes: 45,
  free_only: false,
  created_at: '2025-08-15T10:00:00Z',
  drift_score: 247,
  drift_streak: 4
};

export const MOCK_ATTRACTOR = {
  student_id: 'stu-001',
  departments_visited: ['CS', 'Mathematics'],
  canteen_counters_used: ['Counter 2', 'Counter 5'],
  event_types_attended: ['Technical Talk'],
  new_connections_count: 0,
  content_domains_explored: ['Programming', 'AI/ML', 'Web Dev'],
  last_updated: '2026-02-28T08:00:00Z',
  bubble_percentage: 23,
  departments_ratio: '2 of 14',
  canteen_variety_score: 18,
  event_diversity_score: 12.5
};

export const MOCK_TODAY_DRIFT = {
  id: 'drift-today-001',
  student_id: 'stu-001',
  type: 'canteen',
  title: 'Try Counter 7 instead of Counter 2 today',
  description: 'A Philosophy + Fine Arts student eats here regularly—your profiles have a 91% creative collision potential.',
  location: 'Main Canteen — Counter 7',
  time: '12:30 PM — 1:30 PM',
  collision_potential_score: 91,
  is_free: true,
  time_required_minutes: 60,
  created_at: '2026-02-28T06:00:00Z',
  status: 'pending',
  outcome: null,
  reasoning: {
    gap_description: "Your profile hasn't intersected with Design & Architecture in 47 days",
    days_since_intersection: 47,
    skills_complementarity: 94,
    shared_interests_score: 82,
    timing_alignment: 90,
    gap_profile_match: 86,
    scenario_chips: [
      'Creative collaboration',
      'Skill exchange',
      'New perspective'
    ]
  }
};

export const MOCK_MICRO_DRIFT = {
  id: 'drift-micro-001',
  type: 'route',
  title: '5-min Micro Drift',
  description: 'Alternate route to Library passes Photography Exhibition',
  location: 'Building C Corridor',
  time: 'Anytime today',
  is_free: true,
  time_required_minutes: 5
};

export const MOCK_TONIGHT_DRIFT = {
  id: 'drift-tonight-001',
  type: 'event',
  title: "Tonight's Collision Zone",
  description: 'Open Mic — Music Dept',
  location: 'Music Department Hall',
  time: '7:30 PM',
  is_free: true,
  time_required_minutes: 90,
  complementary_profiles: 3
};

export const MOCK_DRIFT_HISTORY = [
  {
    id: 'drift-h-001',
    student_id: 'stu-001',
    type: 'canteen',
    title: 'Photography Exhibition — Building C',
    description: 'Walking through the Design corridor on the way to the library.',
    location: 'Building C',
    time: '2:00 PM',
    collision_potential_score: 78,
    is_free: true,
    time_required_minutes: 15,
    created_at: '2026-02-23T10:00:00Z',
    status: 'accepted',
    outcome: {
      drift_id: 'drift-h-001',
      was_interesting: true,
      description: 'Met a 3rd year who needed a developer for their art-tech installation',
      logged_at: '2026-02-23T15:00:00Z',
      fingerprint_tags: ['creative', 'connection', 'cross-departmental']
    },
    day: 'MON',
    date: 23
  },
  {
    id: 'drift-h-002',
    student_id: 'stu-001',
    type: 'canteen',
    title: 'Counter 7 — Lunch',
    description: 'New canteen counter experience.',
    location: 'Main Canteen — Counter 7',
    time: '12:30 PM',
    collision_potential_score: 65,
    is_free: true,
    time_required_minutes: 45,
    created_at: '2026-02-24T10:00:00Z',
    status: 'accepted',
    outcome: {
      drift_id: 'drift-h-002',
      was_interesting: false,
      description: null,
      logged_at: '2026-02-24T14:00:00Z',
      fingerprint_tags: ['exploratory']
    },
    day: 'TUE',
    date: 24
  },
  {
    id: 'drift-h-003',
    student_id: 'stu-001',
    type: 'event',
    title: 'Open Mic — Music Dept',
    description: 'Evening open mic featuring student performers.',
    location: 'Music Department Hall',
    time: '7:30 PM',
    collision_potential_score: 88,
    is_free: true,
    time_required_minutes: 90,
    created_at: '2026-02-25T10:00:00Z',
    status: 'skipped',
    outcome: null,
    day: 'WED',
    date: 25
  },
  {
    id: 'drift-h-004',
    student_id: 'stu-001',
    type: 'space',
    title: 'Architecture Model Lab — Open Hours',
    description: 'The Architecture dept opens their model lab to all on Thursdays.',
    location: 'Architecture Building, Ground Floor',
    time: '3:00 PM',
    collision_potential_score: 72,
    is_free: true,
    time_required_minutes: 30,
    created_at: '2026-02-26T10:00:00Z',
    status: 'accepted',
    outcome: {
      drift_id: 'drift-h-004',
      was_interesting: true,
      description: 'Saw CNC machines — realized I can prototype hardware for my ML project',
      logged_at: '2026-02-26T16:00:00Z',
      fingerprint_tags: ['creative', 'cross-departmental', 'exploratory']
    },
    day: 'THU',
    date: 26
  },
  {
    id: 'drift-h-005',
    student_id: 'stu-001',
    type: 'event',
    title: 'Philosophy of AI — Guest Lecture',
    description: 'Philosophy dept guest lecture on ethics and artificial intelligence.',
    location: 'Philosophy Seminar Room',
    time: '4:00 PM',
    collision_potential_score: 95,
    is_free: true,
    time_required_minutes: 60,
    created_at: '2026-02-27T10:00:00Z',
    status: 'accepted',
    outcome: {
      drift_id: 'drift-h-005',
      was_interesting: true,
      description: 'Incredible talk. Joined the Philosophy reading group WhatsApp.',
      logged_at: '2026-02-27T17:30:00Z',
      fingerprint_tags: ['social', 'cross-departmental', 'creative']
    },
    day: 'FRI',
    date: 27
  },
  {
    id: 'drift-h-006',
    student_id: 'stu-001',
    type: 'route',
    title: 'Sports Complex Morning Walk',
    description: 'Take the route through the Sports Complex instead of the usual path.',
    location: 'Sports Complex',
    time: '8:00 AM',
    collision_potential_score: 55,
    is_free: true,
    time_required_minutes: 10,
    created_at: '2026-02-28T06:00:00Z',
    status: 'accepted',
    outcome: null,
    day: 'SAT',
    date: 28
  }
];

export const MOCK_FINGERPRINT = {
  student_id: 'stu-001',
  axes: {
    cross_departmental: 35,
    spontaneous: 45,
    social: 20,
    creative: 40,
    exploratory: 30,
    timing_flexibility: 60
  },
  total_drifts: 12,
  meaningful_drifts: 3,
  meaningful_rate: 0.25,
  best_drift_type: 'canteen',
  best_time_of_day: 'Lunch (12-2PM)',
  last_updated: '2026-02-28T08:00:00Z'
};

export const MOCK_EVENTS = [
  {
    id: 'evt-001',
    title: 'Open Mic Night',
    department: 'Music',
    type: 'performance',
    location: 'Music Department Hall',
    start_time: '2026-02-28T19:30:00Z',
    duration_minutes: 120,
    is_free: true,
    expected_attendees: ['Music', 'Arts', 'Literature'],
    discovery_slot: true
  },
  {
    id: 'evt-002',
    title: 'Startup Pitch Practice',
    department: 'Business',
    type: 'social',
    location: 'Entrepreneurship Cell',
    start_time: '2026-03-01T16:00:00Z',
    duration_minutes: 90,
    is_free: true,
    expected_attendees: ['Business', 'CS', 'Design'],
    discovery_slot: true
  },
  {
    id: 'evt-003',
    title: 'Life Drawing Session',
    department: 'Fine Arts',
    type: 'workshop',
    location: 'Fine Arts Studio 3',
    start_time: '2026-03-01T14:00:00Z',
    duration_minutes: 120,
    is_free: true,
    expected_attendees: ['Fine Arts', 'Design', 'Architecture'],
    discovery_slot: false
  },
  {
    id: 'evt-004',
    title: 'Quantum Computing Intro',
    department: 'Physics',
    type: 'talk',
    location: 'Physics Lecture Hall 2',
    start_time: '2026-03-02T11:00:00Z',
    duration_minutes: 60,
    is_free: true,
    expected_attendees: ['Physics', 'CS', 'Mathematics'],
    discovery_slot: true
  }
];

export const MOCK_DISCOVERY_SLOTS = [
  {
    id: 'ds-001',
    organizer_id: 'club-photo',
    organizer_type: 'club',
    name: 'Photography Club — Portfolio Reviews',
    location: 'Building C, Room 204',
    available_times: ['2026-03-01T15:00:00Z', '2026-03-01T16:00:00Z'],
    description: 'Get your portfolio reviewed by senior photographers. Open to all departments.',
    tags: ['creative', 'portfolio', 'photography']
  },
  {
    id: 'ds-002',
    organizer_id: 'club-debate',
    organizer_type: 'club',
    name: 'Debate Society — Open Practice',
    location: 'Philosophy Building, Room 101',
    available_times: ['2026-03-02T17:00:00Z'],
    description: 'Practice debate rounds. No experience needed.',
    tags: ['social', 'speaking', 'philosophy']
  }
];

export const UNEXPLORED_AREAS = [
  {
    name: 'Design & Architecture',
    icon: '🎨',
    students: 12,
    interactions: 0,
    driftCta: 'Drift Here →'
  },
  {
    name: 'Performing Arts',
    icon: '🎭',
    events: 4,
    eventsLabel: '4 events this week, all free',
    driftCta: 'Drift Here →'
  },
  {
    name: 'Entrepreneurship Cell',
    icon: '🚀',
    note: 'Looking for tech co-founders right now',
    driftCta: 'Drift Here →'
  },
  {
    name: 'Philosophy Department',
    icon: '🧠',
    students: 8,
    interactions: 0,
    driftCta: 'Drift Here →'
  },
  {
    name: 'Sports Science',
    icon: '⚡',
    events: 2,
    eventsLabel: '2 open sessions this week',
    driftCta: 'Drift Here →'
  }
];

export const ALL_DEPARTMENTS = [
  'CS', 'Design', 'Arts', 'Business', 'Science',
  'Engineering', 'Philosophy', 'Music', 'Architecture',
  'Economics', 'Psychology', 'Sports'
];

export const SKILL_SUGGESTIONS = [
  'Python', 'UI/UX', 'Writing', 'Electronics',
  'Music Production', 'Video Editing', 'Research', 'Marketing',
  '3D Modeling', 'Public Speaking', 'Data Analysis', 'Photography'
];
