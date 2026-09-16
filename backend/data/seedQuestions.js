import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from '../models/Question.js';

dotenv.config();

const sampleQuestions = [
  {
    text: 'Explain the Virtual DOM in React and how reconciliation works.',
    category: 'Technical',
    role: 'Frontend Developer',
    difficulty: 'Medium',
    idealPoints: [
      'In-memory lightweight representation of the real DOM tree',
      'Diffing algorithm compares previous and current Virtual DOM states',
      'Batching DOM updates minimizes expensive browser repaints and reflows',
      'Keys help React identify moved, updated, or deleted list items efficiently',
    ],
    tags: ['React', 'JavaScript', 'Frontend', 'DOM'],
  },
  {
    text: 'How do you optimize web application performance for slow networks?',
    category: 'Technical',
    role: 'Frontend Developer',
    difficulty: 'Hard',
    idealPoints: [
      'Code splitting and lazy loading components/routes',
      'Asset optimization: image compression, WebP format, SVG icons',
      'Browser caching, CDN usage, and HTTP/2 or HTTP/3 multiplexing',
      'Service workers and offline-first caching strategies',
    ],
    tags: ['Performance', 'Web', 'Frontend'],
  },
  {
    text: 'Explain the difference between SQL and NoSQL databases. When would you pick MongoDB over PostgreSQL?',
    category: 'Technical',
    role: 'Backend Developer',
    difficulty: 'Medium',
    idealPoints: [
      'Relational (SQL) vs Document/KeyValue/Graph (NoSQL) structure',
      'ACID compliance and strict schemas in SQL vs horizontal scaling and flexible schema in NoSQL',
      'Pick MongoDB for rapidly changing schemas, hierarchical data, or high write volume',
      'Pick PostgreSQL for complex transactional relations and structured analytics',
    ],
    tags: ['Database', 'MongoDB', 'PostgreSQL', 'Backend'],
  },
  {
    text: 'How does Event Loop concurrency work in Node.js?',
    category: 'Technical',
    role: 'Backend Developer',
    difficulty: 'Hard',
    idealPoints: [
      'Single-threaded JavaScript execution using libuv thread pool for async I/O',
      'Phases of the event loop: Timers, Pending Callbacks, Poll, Check (setImmediate), Close Callbacks',
      'Microtask queue (Promises, process.nextTick) executes between macro-phases',
      'Non-blocking I/O vs blocking CPU-bound computations',
    ],
    tags: ['Node.js', 'EventLoop', 'Async', 'Backend'],
  },
  {
    text: 'Design a URL shortener service like Bit.ly. How would you handle high traffic and key collisions?',
    category: 'System Design',
    role: 'Full Stack Developer',
    difficulty: 'Hard',
    idealPoints: [
      'Base62 encoding of auto-incrementing ID or MD5 hash hashing with collision retries',
      'Caching hot URLs using Redis to achieve sub-millisecond reads',
      'Database sharding or partitioning by hash prefix',
      'Rate limiting and CDN edge redirects',
    ],
    tags: ['System Design', 'Scaling', 'Redis', 'Hashing'],
  },
  {
    text: 'How would you design a scalable real-time notification system for millions of connected users?',
    category: 'System Design',
    role: 'Software Engineer',
    difficulty: 'Hard',
    idealPoints: [
      'WebSocket protocol / Server-Sent Events (SSE) for persistent connections',
      'Pub/Sub messaging backbone (Redis Pub/Sub, Apache Kafka, or RabbitMQ)',
      'Connection gateways cluster with sticky sessions or state store',
      'Fallback mechanism to HTTP long polling for legacy clients',
    ],
    tags: ['System Design', 'WebSockets', 'RealTime', 'Kafka'],
  },
  {
    text: 'Describe a situation where a technical project was falling behind schedule. How did you handle it?',
    category: 'Behavioral',
    role: 'General',
    difficulty: 'Medium',
    idealPoints: [
      'STAR technique (Situation, Task, Action, Result)',
      'Proactive identification of bottlenecks and transparent communication with stakeholders',
      'Scoping down non-essential features (MVP prioritization)',
      'Mentoring teammates or re-allocating engineering resources effectively',
    ],
    tags: ['Behavioral', 'Leadership', 'Project Management'],
  },
  {
    text: 'Tell me about a time you had a strong technical disagreement with a senior teammate or tech lead. How was it resolved?',
    category: 'Behavioral',
    role: 'General',
    difficulty: 'Medium',
    idealPoints: [
      'Focusing on objective data, benchmarks, and prototype proof-of-concepts rather than opinions',
      'Active listening and seeking to understand the underlying technical concerns',
      'Reaching consensus or committing to the decision once finalized (Disagree and Commit)',
    ],
    tags: ['Behavioral', 'Conflict Resolution', 'Teamwork'],
  },
  {
    text: 'Where do you see yourself in 3 to 5 years, and how does this role align with your career goals?',
    category: 'HR',
    role: 'General',
    difficulty: 'Easy',
    idealPoints: [
      'Clear commitment to continuous learning and technical mastery',
      'Desire to take on larger architectural responsibilities or leadership roles',
      'Alignment between personal aspirations and company mission/domain',
    ],
    tags: ['HR', 'Career Goals', 'Motivation'],
  },
  {
    text: 'Why are you looking to leave your current role / transition into this role right now?',
    category: 'HR',
    role: 'General',
    difficulty: 'Easy',
    idealPoints: [
      'Positive framing focused on seeking new growth and technical challenges rather than complaining',
      'Specific excitement about this team, product, or technology stack',
      'Demonstrated research into company culture and values',
    ],
    tags: ['HR', 'Transition', 'Culture'],
  },
  {
    text: 'Explain CORS (Cross-Origin Resource Sharing) and how browsers handle preflight requests.',
    category: 'Technical',
    role: 'Full Stack Developer',
    difficulty: 'Medium',
    idealPoints: [
      'Browser security mechanism enforcing Same-Origin Policy',
      'Preflight OPTIONS request sent for non-simple HTTP requests (custom headers, PUT/DELETE)',
      'Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers response headers',
      'Credentials handling (Access-Control-Allow-Credentials)',
    ],
    tags: ['Security', 'CORS', 'HTTP', 'Web'],
  },
  {
    text: 'Describe how JWT authentication works end-to-end between client and server.',
    category: 'Technical',
    role: 'Software Engineer',
    difficulty: 'Medium',
    idealPoints: [
      'Three parts of JWT: Header, Payload, Signature',
      'Server signs payload with secret/private key upon user login',
      'Client stores token (localStorage / httpOnly cookie) and sends Bearer token in Authorization header',
      'Stateless verification on server without querying session database',
    ],
    tags: ['JWT', 'Authentication', 'Security', 'Backend'],
  },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interview_platform';
    await mongoose.connect(mongoUri);
    console.log(`[seed] Connected to MongoDB at ${mongoUri}`);

    await Question.deleteMany({});
    console.log('[seed] Cleared existing Question collection');

    const created = await Question.insertMany(sampleQuestions);
    console.log(`[seed] Successfully seeded ${created.length} interview questions!`);

    process.exit(0);
  } catch (error) {
    console.error(`[seed] Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
