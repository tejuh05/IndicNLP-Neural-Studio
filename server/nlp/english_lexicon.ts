/**
 * Comprehensive English Lexicon & Morphological Defense Layer
 * Contains 3000+ core high-frequency English words across conversational,
 * technology, academic, workplace, urban transit, and everyday domains.
 * Includes rule-based morphological stemming and an explicit exception list
 * for English words ending in Dravidian-like suffixes (e.g., "-ge").
 */

// 1. Explicit English words ending in "ge" that must NOT be parsed as Kannada dative "-ge"
export const ENGLISH_GE_EXCEPTIONS = new Set([
  'college', 'orange', 'cabbage', 'message', 'package', 'image', 'stage', 'page',
  'storage', 'luggage', 'baggage', 'bridge', 'fridge', 'judge', 'gauge', 'charge',
  'change', 'range', 'large', 'huge', 'manage', 'damage', 'village', 'cottage',
  'carriage', 'voyage', 'garbage', 'shortage', 'courage', 'average', 'beverage',
  'heritage', 'language', 'passage', 'usage', 'vintage', 'bandage', 'bondage',
  'mileage', 'postage', 'sewage', 'voltage', 'wreckage', 'merge', 'surge', 'purge',
  'sponge', 'plunge', 'lounge', 'hinge', 'singe', 'tinge', 'binge', 'forge', 'gorge',
  'urge', 'edge', 'hedge', 'wedge', 'ledge', 'sledge', 'badge', 'dodge', 'lodge',
  'advantage', 'disadvantage', 'knowledge', 'challenge', 'privilege', 'colleague',
  'league', 'plague', 'vague', 'rogue', 'clique', 'plaque', 'torque', 'mosque'
]);

// 2. Comprehensive 3000+ core English lexicon
const RAW_LEXICON_WORDS: string[] = [
  // --- Pronouns & Determiners ---
  'i', 'me', 'my', 'mine', 'myself', 'we', 'us', 'our', 'ours', 'ourselves',
  'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself',
  'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
  'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'whose', 'this', 'that',
  'these', 'those', 'all', 'another', 'any', 'anybody', 'anyone', 'anything',
  'both', 'each', 'either', 'everybody', 'everyone', 'everything', 'few', 'many',
  'more', 'most', 'much', 'neither', 'nobody', 'no one', 'none', 'nothing', 'one',
  'other', 'others', 'several', 'some', 'somebody', 'someone', 'something', 'such',

  // --- Auxiliary & Modal Verbs ---
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'having',
  'do', 'does', 'did', 'doing', 'done',
  'can', 'could', 'shall', 'should', 'will', 'would', 'may', 'might', 'must',

  // --- Prepositions & Conjunctions ---
  'about', 'above', 'across', 'after', 'against', 'along', 'among', 'around',
  'at', 'before', 'behind', 'below', 'beneath', 'beside', 'between', 'beyond',
  'by', 'down', 'during', 'except', 'for', 'from', 'in', 'inside', 'into',
  'near', 'of', 'off', 'on', 'onto', 'out', 'outside', 'over', 'past', 'since',
  'through', 'throughout', 'to', 'toward', 'towards', 'under', 'underneath',
  'until', 'up', 'upon', 'with', 'within', 'without',
  'and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'although', 'because', 'since',
  'unless', 'while', 'where', 'whereas', 'wherever', 'whether', 'though', 'if',

  // --- Time, Frequency & Manner Adverbs ---
  'today', 'tomorrow', 'yesterday', 'now', 'then', 'soon', 'later', 'already',
  'always', 'never', 'sometimes', 'often', 'rarely', 'seldom', 'usually',
  'daily', 'weekly', 'monthly', 'yearly', 'tonight', 'morning', 'afternoon',
  'evening', 'night', 'early', 'late', 'first', 'last', 'next', 'previous',
  'again', 'also', 'just', 'only', 'even', 'still', 'almost', 'enough',
  'very', 'quite', 'too', 'well', 'here', 'there', 'everywhere', 'nowhere',
  'anywhere', 'somewhere', 'fast', 'slowly', 'quickly', 'easily', 'hard',

  // --- Software, Tech, Engineering & Data ---
  'code', 'program', 'system', 'software', 'hardware', 'server', 'database',
  'network', 'client', 'app', 'application', 'browser', 'website', 'web',
  'internet', 'cloud', 'api', 'endpoint', 'route', 'query', 'request',
  'response', 'header', 'token', 'payload', 'schema', 'table', 'row', 'column',
  'index', 'key', 'value', 'cache', 'memory', 'cpu', 'process', 'thread',
  'async', 'sync', 'file', 'folder', 'directory', 'path', 'script', 'module',
  'package', 'library', 'framework', 'git', 'commit', 'branch', 'merge',
  'pull', 'push', 'repo', 'repository', 'bug', 'issue', 'fix', 'error',
  'exception', 'warning', 'log', 'logger', 'trace', 'stack', 'debug', 'release',
  'deploy', 'deployment', 'pipeline', 'build', 'compile', 'compiler', 'test',
  'testing', 'unit', 'mock', 'benchmark', 'performance', 'latency', 'bandwidth',
  'security', 'auth', 'authentication', 'authorization', 'permission', 'role',
  'user', 'admin', 'profile', 'session', 'cookie', 'domain', 'host', 'port',
  'proxy', 'gateway', 'load', 'balancer', 'docker', 'container', 'cluster',
  'node', 'worker', 'queue', 'event', 'listener', 'handler', 'callback',
  'function', 'variable', 'constant', 'class', 'object', 'interface', 'type',
  'enum', 'array', 'list', 'string', 'number', 'boolean', 'null', 'undefined',
  'component', 'view', 'state', 'hook', 'props', 'render', 'dom', 'ui', 'ux',
  'design', 'layout', 'style', 'sheet', 'theme', 'dark', 'light', 'button',
  'input', 'form', 'modal', 'popup', 'dialog', 'card', 'panel', 'tab', 'menu',
  'nav', 'navbar', 'footer', 'sidebar', 'icon', 'image', 'asset', 'font',
  'color', 'margin', 'padding', 'border', 'shadow', 'grid', 'flex', 'box',
  'screen', 'display', 'mobile', 'desktop', 'tablet', 'device', 'responsive',
  'model', 'neural', 'machine', 'learning', 'dataset', 'corpus', 'annotation',
  'inference', 'embedding', 'vector', 'matrix', 'tensor', 'accuracy', 'precision',
  'recall', 'score', 'metric', 'loss', 'gradient', 'epoch', 'batch', 'weight',
  'bias', 'layer', 'attention', 'transformer', 'prompt', 'context', 'token',
  'tokenizer', 'transliteration', 'morphology', 'syntax', 'semantics', 'pos',
  'tag', 'tagger', 'tree', 'parse', 'parser', 'parsing', 'grammar', 'rule',

  // --- Corporate, Office, Management & Meetings ---
  'office', 'meeting', 'team', 'group', 'company', 'firm', 'agency', 'client',
  'customer', 'manager', 'lead', 'director', 'boss', 'employee', 'worker',
  'colleague', 'partner', 'staff', 'hr', 'finance', 'sales', 'marketing',
  'product', 'project', 'task', 'ticket', 'sprint', 'scrum', 'agile', 'kanban',
  'board', 'deadline', 'agenda', 'minutes', 'note', 'document', 'doc', 'sheet',
  'slide', 'presentation', 'demo', 'pitch', 'report', 'review', 'audit',
  'plan', 'strategy', 'goal', 'target', 'objective', 'milestone', 'deliverable',
  'budget', 'cost', 'expense', 'invoice', 'payment', 'salary', 'bonus', 'payroll',
  'contract', 'agreement', 'policy', 'guideline', 'process', 'workflow',
  'standup', 'retrospective', 'sync', 'call', 'video', 'conference', 'room',
  'desk', 'chair', 'cubicle', 'cabin', 'laptop', 'phone', 'headset', 'cable',
  'charger', 'monitor', 'keyboard', 'mouse', 'printer', 'paper', 'pen',

  // --- College, Campus, Academic & Study ---
  'college', 'university', 'campus', 'school', 'academy', 'institute', 'department',
  'library', 'lab', 'laboratory', 'classroom', 'auditorium', 'hostel', 'canteen',
  'ground', 'sports', 'exam', 'examination', 'test', 'quiz', 'assignment',
  'homework', 'course', 'subject', 'syllabus', 'curriculum', 'lecture', 'session',
  'seminar', 'workshop', 'professor', 'teacher', 'instructor', 'mentor', 'guide',
  'student', 'scholar', 'batch', 'roll', 'degree', 'diploma', 'certificate',
  'grade', 'marks', 'result', 'pass', 'fail', 'rank', 'credit', 'semester',
  'attendance', 'hall', 'ticket', 'id', 'card', 'fees', 'scholarship', 'study',
  'read', 'write', 'learn', 'teach', 'practice', 'revise', 'revision', 'book',
  'textbook', 'notebook', 'notes', 'chapter', 'page', 'topic', 'concept', 'formula',
  'question', 'answer', 'solution', 'problem', 'exercise', 'thesis', 'research',

  // --- Urban Transit, Travel & Commute ---
  'bus', 'train', 'metro', 'auto', 'cab', 'taxi', 'car', 'bike', 'scooter',
  'vehicle', 'traffic', 'jam', 'signal', 'road', 'street', 'highway', 'lane',
  'flyover', 'bridge', 'junction', 'cross', 'stop', 'station', 'terminal',
  'airport', 'flight', 'platform', 'route', 'map', 'navigation', 'gps', 'ride',
  'driver', 'passenger', 'commute', 'trip', 'travel', 'journey', 'ticket',
  'fare', 'pass', 'booking', 'seat', 'berth', 'coach', 'schedule', 'timing',
  'delay', 'arrival', 'departure', 'distance', 'speed', 'fuel', 'petrol', 'diesel',

  // --- Food, Dining, Lifestyle & Daily Transit ---
  'food', 'meal', 'breakfast', 'lunch', 'dinner', 'snack', 'tea', 'coffee',
  'water', 'juice', 'milk', 'bread', 'rice', 'curry', 'restaurant', 'cafe',
  'hotel', 'kitchen', 'cook', 'eat', 'drink', 'order', 'delivery', 'bill',
  'tip', 'home', 'house', 'room', 'apartment', 'flat', 'building', 'door',
  'window', 'bed', 'sleep', 'wake', 'rest', 'walk', 'run', 'bath', 'wash',
  'clean', 'clothes', 'dress', 'shirt', 'pants', 'shoes', 'bag', 'wallet',
  'watch', 'glasses', 'umbrella', 'key', 'lock', 'money', 'cash', 'card',

  // --- Common Verbs (Base Forms) ---
  'accept', 'achieve', 'acquire', 'act', 'add', 'address', 'adjust', 'admit',
  'affect', 'afford', 'agree', 'allow', 'alter', 'analyze', 'announce',
  'answer', 'appear', 'apply', 'appoint', 'appreciate', 'approach', 'approve',
  'argue', 'arrange', 'arrive', 'ask', 'assess', 'assist', 'assume', 'attach',
  'attempt', 'attend', 'attract', 'avoid', 'await', 'award', 'bake', 'balance',
  'base', 'beat', 'become', 'begin', 'behave', 'believe', 'belong', 'bend',
  'benefit', 'bet', 'bid', 'bind', 'bite', 'blame', 'bleed', 'blow', 'boil',
  'borrow', 'bother', 'bounce', 'break', 'breathe', 'bring', 'broadcast',
  'brush', 'build', 'burn', 'burst', 'buy', 'calculate', 'call', 'calm',
  'cancel', 'capture', 'care', 'carry', 'catch', 'cause', 'celebrate', 'center',
  'chain', 'challenge', 'change', 'charge', 'chase', 'cheat', 'check', 'cheer',
  'choose', 'chop', 'claim', 'clap', 'clarify', 'clean', 'clear', 'climb',
  'close', 'coach', 'collect', 'combine', 'come', 'comfort', 'command',
  'comment', 'commit', 'communicate', 'compare', 'compete', 'complain',
  'complete', 'compose', 'compute', 'conceal', 'concentrate', 'concern',
  'conclude', 'conduct', 'confirm', 'connect', 'consider', 'consist', 'construct',
  'consult', 'consume', 'contact', 'contain', 'continue', 'contribute', 'control',
  'convert', 'convince', 'cook', 'cool', 'cooperate', 'copy', 'correct',
  'cost', 'count', 'cover', 'crash', 'create', 'cross', 'cry', 'cure',
  'damage', 'dance', 'dare', 'deal', 'debate', 'decide', 'declare', 'decrease',
  'dedicate', 'defend', 'define', 'delay', 'deliver', 'demand', 'demonstrate',
  'deny', 'depend', 'deploy', 'describe', 'deserve', 'design', 'desire',
  'destroy', 'detect', 'determine', 'develop', 'devote', 'differ', 'direct',
  'disagree', 'disappear', 'discover', 'discuss', 'display', 'distribute',
  'dive', 'divide', 'divorce', 'document', 'download', 'drag', 'drain',
  'draw', 'dream', 'dress', 'drink', 'drive', 'drop', 'dry', 'earn', 'eat',
  'edit', 'educate', 'elect', 'eliminate', 'emerge', 'emphasize', 'employ',
  'enable', 'encourage', 'end', 'engage', 'engineer', 'enjoy', 'enter',
  'entertain', 'escape', 'establish', 'estimate', 'evaluate', 'examine',
  'exceed', 'exchange', 'excite', 'exclude', 'excuse', 'execute', 'exercise',
  'exhibit', 'exist', 'expand', 'expect', 'experience', 'explain', 'explode',
  'explore', 'export', 'expose', 'express', 'extend', 'extract', 'face',
  'facilitate', 'fade', 'fail', 'fall', 'fancy', 'fasten', 'fear', 'feature',
  'feed', 'feel', 'fight', 'figure', 'file', 'fill', 'film', 'filter',
  'finalize', 'finance', 'find', 'finish', 'fire', 'fish', 'fit', 'fix',
  'flash', 'flee', 'flip', 'float', 'flood', 'flow', 'fly', 'focus', 'fold',
  'follow', 'forbid', 'force', 'forecast', 'forget', 'forgive', 'form',
  'format', 'found', 'frame', 'freeze', 'frighten', 'fry', 'fulfill', 'function',
  'gain', 'gather', 'generate', 'get', 'give', 'glance', 'glow', 'go', 'govern',
  'grab', 'grade', 'grant', 'grasp', 'greet', 'grow', 'guarantee', 'guard',
  'guess', 'guide', 'handle', 'hang', 'happen', 'harm', 'hate', 'haunt',
  'head', 'heal', 'hear', 'heat', 'help', 'hesitate', 'hide', 'hire', 'hit',
  'hold', 'hope', 'host', 'hug', 'hunt', 'hurry', 'hurt', 'identify', 'ignore',
  'illustrate', 'imagine', 'implement', 'imply', 'import', 'impose', 'impress',
  'improve', 'include', 'incorporate', 'increase', 'indicate', 'influence',
  'inform', 'inherit', 'initial', 'initiate', 'inject', 'injure', 'insert',
  'insist', 'inspect', 'install', 'instruct', 'insure', 'integrate', 'intend',
  'interact', 'interest', 'interpret', 'interrupt', 'interview', 'introduce',
  'invent', 'invest', 'investigate', 'invite', 'involve', 'isolate', 'issue',
  'join', 'joke', 'judge', 'jump', 'justify', 'keep', 'kick', 'kill', 'kiss',
  'knock', 'know', 'label', 'lack', 'land', 'last', 'laugh', 'launch', 'lead',
  'leak', 'lean', 'leap', 'learn', 'leave', 'lend', 'let', 'level', 'license',
  'lift', 'light', 'like', 'limit', 'link', 'list', 'listen', 'live', 'load',
  'loan', 'locate', 'lock', 'log', 'look', 'lose', 'love', 'lower', 'mail',
  'maintain', 'make', 'manage', 'manufacture', 'map', 'march', 'mark',
  'marry', 'match', 'matter', 'mean', 'measure', 'meet', 'melt', 'mention',
  'merge', 'message', 'migrate', 'mind', 'mine', 'minimize', 'miss', 'mix',
  'modify', 'monitor', 'motivate', 'mount', 'move', 'multiply', 'name',
  'narrow', 'navigate', 'near', 'need', 'negotiate', 'nod', 'nominate', 'note',
  'notice', 'notify', 'number', 'obey', 'object', 'observe', 'obtain', 'occupy',
  'occur', 'offend', 'offer', 'open', 'operate', 'oppose', 'opt', 'order',
  'organize', 'originate', 'outline', 'overcome', 'overlook', 'owe', 'own',
  'pack', 'package', 'paint', 'park', 'part', 'participate', 'pass', 'paste',
  'pat', 'patch', 'pause', 'pay', 'perform', 'permit', 'persist', 'persuade',
  'phone', 'photograph', 'pick', 'pile', 'pilot', 'pin', 'place', 'plan',
  'plant', 'play', 'please', 'plot', 'point', 'polish', 'poll', 'post', 'pour',
  'power', 'practice', 'praise', 'pray', 'predict', 'prefer', 'prepare',
  'present', 'preserve', 'press', 'presume', 'pretend', 'prevent', 'print',
  'prioritize', 'proceed', 'process', 'produce', 'program', 'progress',
  'prohibit', 'project', 'promise', 'promote', 'prompt', 'propose', 'protect',
  'protest', 'prove', 'provide', 'publish', 'pull', 'pump', 'punch', 'purchase',
  'pursue', 'push', 'qualify', 'question', 'quit', 'quote', 'race', 'rain',
  'raise', 'range', 'rank', 'rate', 'reach', 'react', 'read', 'ready',
  'realize', 'rebuild', 'recall', 'receive', 'recognize', 'recommend', 'record',
  'recover', 'recruit', 'reduce', 'refer', 'reflect', 'reform', 'refuse',
  'regard', 'register', 'regret', 'regulate', 'reinforce', 'reject', 'relate',
  'relax', 'release', 'rely', 'remain', 'remark', 'remember', 'remind',
  'remove', 'render', 'renew', 'rent', 'repair', 'repeat', 'replace', 'reply',
  'report', 'represent', 'reproduce', 'request', 'require', 'rescue', 'research',
  'resemble', 'reserve', 'reset', 'reside', 'resist', 'resolve', 'resort',
  'respect', 'respond', 'rest', 'restore', 'restrict', 'result', 'retain',
  'retire', 'retrieve', 'return', 'reveal', 'reverse', 'review', 'revise',
  'reward', 'rid', 'ride', 'ring', 'rise', 'risk', 'roll', 'route', 'row',
  'rub', 'rule', 'run', 'rush', 'sail', 'sample', 'satisfy', 'save', 'say',
  'scale', 'scan', 'scare', 'scatter', 'schedule', 'score', 'scream', 'screen',
  'screw', 'seal', 'search', 'seat', 'secure', 'see', 'seek', 'seem', 'select',
  'sell', 'send', 'sense', 'sentence', 'separate', 'serve', 'service', 'set',
  'settle', 'sew', 'shade', 'shake', 'shape', 'share', 'shave', 'shift',
  'shine', 'ship', 'shock', 'shoot', 'shop', 'shout', 'show', 'shrink', 'shut',
  'sigh', 'sign', 'signal', 'simplify', 'sing', 'sink', 'sit', 'sketch',
  'skip', 'slam', 'sleep', 'slide', 'slip', 'slow', 'smash', 'smell', 'smile',
  'smoke', 'snap', 'snow', 'soak', 'solve', 'sort', 'sound', 'source', 'spare',
  'speak', 'specify', 'speed', 'spell', 'spend', 'spill', 'spin', 'split',
  'spoil', 'sponsor', 'spot', 'spread', 'spring', 'stack', 'stage', 'stain',
  'stand', 'stare', 'start', 'state', 'station', 'stay', 'steal', 'steam',
  'steer', 'stem', 'step', 'stick', 'stimulate', 'stir', 'stop', 'store',
  'strain', 'stream', 'stress', 'stretch', 'strike', 'strip', 'stroke',
  'structure', 'struggle', 'study', 'stuff', 'stumble', 'style', 'submit',
  'subscribe', 'succeed', 'sue', 'suffer', 'suggest', 'suit', 'summarize',
  'supervise', 'supply', 'support', 'suppose', 'suppress', 'surprise',
  'surround', 'survey', 'survive', 'suspect', 'suspend', 'sustain', 'swallow',
  'swear', 'sweep', 'swim', 'swing', 'switch', 'symbolize', 'synthesize',
  'tackle', 'tag', 'tailor', 'take', 'talk', 'tap', 'target', 'taste', 'tax',
  'teach', 'tear', 'tell', 'tempt', 'tend', 'terminate', 'test', 'thank',
  'think', 'threaten', 'throw', 'thrust', 'tick', 'tie', 'tighten', 'time',
  'tip', 'tire', 'tolerate', 'toss', 'total', 'touch', 'tour', 'trace',
  'track', 'trade', 'traffic', 'train', 'transfer', 'transform', 'translate',
  'transmit', 'transport', 'trap', 'travel', 'treat', 'tremble', 'trigger',
  'trim', 'trip', 'trouble', 'trust', 'try', 'tune', 'turn', 'twist', 'type',
  'undergo', 'understand', 'undertake', 'undo', 'unfold', 'unify', 'unite',
  'unlock', 'unpack', 'update', 'upgrade', 'uphold', 'upload', 'upset',
  'urge', 'use', 'utilize', 'validate', 'value', 'vanish', 'vary', 'verify',
  'view', 'violate', 'visit', 'voice', 'volunteer', 'vote', 'wait', 'wake',
  'walk', 'wander', 'want', 'warm', 'warn', 'warrant', 'wash', 'waste',
  'watch', 'water', 'wave', 'wear', 'weigh', 'welcome', 'widen', 'win', 'wind',
  'wipe', 'wire', 'wish', 'withdraw', 'withhold', 'withstand', 'witness',
  'wonder', 'work', 'worry', 'wrap', 'wreck', 'wrestle', 'write', 'yield',

  // --- Common Adjectives & Nouns ---
  'able', 'absolute', 'abstract', 'academic', 'acceptable', 'accessible',
  'accurate', 'active', 'actual', 'acute', 'additional', 'adequate',
  'administrative', 'adult', 'advanced', 'adverse', 'aesthetic', 'affordable',
  'afraid', 'aggressive', 'agreed', 'agricultural', 'alive', 'allied',
  'alone', 'alternative', 'amazing', 'ambient', 'ambitious', 'amused',
  'ancient', 'angry', 'annual', 'anonymous', 'anxious', 'apparent', 'appealing',
  'applicable', 'appropriate', 'approximate', 'arbitrary', 'architectural',
  'armed', 'artificial', 'artistic', 'ashamed', 'asleep', 'assistant',
  'associated', 'astonishing', 'athletic', 'atomic', 'attached', 'attractive',
  'audible', 'authentic', 'authoritative', 'automated', 'automatic',
  'available', 'average', 'aware', 'awesome', 'awful', 'bad', 'balanced',
  'bare', 'basic', 'beautiful', 'beneficial', 'best', 'better', 'big',
  'binary', 'biological', 'bitter', 'bizarre', 'black', 'blank', 'bleak',
  'blind', 'blonde', 'blue', 'bold', 'bored', 'boring', 'bound', 'brave',
  'brief', 'bright', 'brilliant', 'broad', 'broken', 'brown', 'busy', 'calm',
  'capable', 'capital', 'careful', 'careless', 'casual', 'catastrophic',
  'causal', 'cautious', 'central', 'certain', 'champion', 'charming', 'cheap',
  'cheerful', 'chemical', 'chief', 'chronic', 'circular', 'civic', 'civil',
  'classic', 'classical', 'clean', 'clear', 'clever', 'climatic', 'clinical',
  'close', 'closed', 'clumsy', 'coastal', 'cognitive', 'coherent', 'cold',
  'collective', 'colonial', 'color', 'colossal', 'combined', 'comfortable',
  'commercial', 'common', 'compact', 'comparable', 'comparative', 'compatible',
  'competent', 'competitive', 'complete', 'complex', 'complicated',
  'comprehensive', 'compulsory', 'computational', 'concise', 'concrete',
  'confident', 'confidential', 'confused', 'conscious', 'consecutive',
  'conservative', 'considerable', 'consistent', 'constant', 'constitutional',
  'contemporary', 'content', 'continental', 'continuous', 'convenient',
  'conventional', 'cool', 'cooperative', 'coordinate', 'corporate', 'correct',
  'corresponding', 'corrupt', 'costly', 'crazy', 'creative', 'credible',
  'critical', 'crowded', 'crucial', 'crude', 'cruel', 'cultural', 'curious',
  'current', 'custom', 'cute', 'cynical', 'daily', 'damaging', 'dangerous',
  'dark', 'dead', 'deadly', 'dear', 'decent', 'decisive', 'dedicated',
  'deep', 'defensive', 'definite', 'deliberate', 'delicate', 'delicious',
  'delighted', 'delightful', 'democratic', 'dense', 'dependent', 'depressed',
  'descriptive', 'desirable', 'desperate', 'detailed', 'determined',
  'devastating', 'different', 'difficult', 'digital', 'diplomatic', 'direct',
  'dirty', 'disabled', 'disastrous', 'disciplined', 'discrete', 'discriminatory',
  'distinct', 'distinctive', 'distinguished', 'distributed', 'diverse',
  'divine', 'domestic', 'dominant', 'double', 'doubtful', 'dramatic',
  'dreadful', 'dry', 'dual', 'due', 'dull', 'dumb', 'dynamic', 'eager', 'early',
  'earnest', 'earthly', 'easy', 'economic', 'economical', 'educated',
  'educational', 'effective', 'efficient', 'elaborate', 'elderly', 'electoral',
  'electric', 'electrical', 'electronic', 'elegant', 'elementary', 'eligible',
  'elite', 'embarrassed', 'emotional', 'empirical', 'empty', 'encouraging',
  'endless', 'energetic', 'enormous', 'enthusiastic', 'entire', 'environmental',
  'equal', 'equivalent', 'essential', 'established', 'eternal', 'ethical',
  'ethnic', 'evaluative', 'evident', 'evil', 'evolutionary', 'exact',
  'excellent', 'exceptional', 'excessive', 'exclusive', 'executive', 'exempt',
  'exhausted', 'existing', 'exotic', 'expensive', 'experienced', 'experimental',
  'expert', 'explicit', 'explosive', 'extensive', 'external', 'extra',
  'extraordinary', 'extreme', 'fabulous', 'fair', 'faithful', 'false',
  'familiar', 'famous', 'fantastic', 'far', 'fascinating', 'fashionable',
  'fast', 'fatal', 'favorable', 'favorite', 'feasible', 'federal', 'feminine',
  'fierce', 'final', 'financial', 'fine', 'finite', 'firm', 'fit', 'fixed',
  'flat', 'flawless', 'flexible', 'floating', 'fluent', 'fluid', 'flying',
  'focused', 'folk', 'foolish', 'foreign', 'formal', 'formidable', 'forthcoming',
  'fortunate', 'forward', 'foster', 'fragile', 'frank', 'free', 'frequent',
  'fresh', 'friendly', 'frightened', 'front', 'frozen', 'fruitful', 'frustrated',
  'full', 'fundamental', 'funny', 'furious', 'future', 'general', 'generous',
  'genetic', 'genuine', 'geographical', 'giant', 'glad', 'global', 'glorious',
  'golden', 'good', 'gorgeous', 'governing', 'graceful', 'gradual', 'grand',
  'graphic', 'grateful', 'grave', 'gray', 'great', 'green', 'grey', 'grim',
  'gross', 'growing', 'guilty', 'habitual', 'handy', 'happy', 'hard',
  'harmful', 'harsh', 'healthy', 'heavy', 'helpful', 'helpless', 'hidden',
  'high', 'historic', 'historical', 'hollow', 'holy', 'homeless', 'honest',
  'honorable', 'hopeful', 'horizontal', 'horrible', 'hostile', 'hot',
  'huge', 'human', 'humble', 'humorous', 'hungry', 'hurt', 'hybrid', 'ideal',
  'identical', 'idle', 'ignorant', 'ill', 'illegal', 'illiterate', 'illustrious',
  'imaginary', 'immediate', 'immense', 'imminent', 'immune', 'impatient',
  'imperative', 'imperial', 'implicit', 'important', 'impossible', 'impressive',
  'improbable', 'inadequate', 'inappropriate', 'incidental', 'inclusive',
  'incoming', 'incompetent', 'incomplete', 'incredible', 'independent',
  'indicative', 'indifferent', 'indigenous', 'indirect', 'individual',
  'indoor', 'industrial', 'inevitable', 'inexpensive', 'infamous', 'infant',
  'infectious', 'inferior', 'infinite', 'informal', 'inherent', 'initial',
  'injured', 'innocent', 'innovative', 'insane', 'insecure', 'insightful',
  'insistent', 'instant', 'institutional', 'instrumental', 'insufficient',
  'intact', 'integral', 'intellectual', 'intelligent', 'intense', 'intensive',
  'interactive', 'interested', 'interesting', 'interior', 'intermediate',
  'internal', 'international', 'intimate', 'intrinsic', 'invalid', 'invaluable',
  'inventive', 'inverse', 'invisible', 'involuntary', 'ironic', 'irrational',
  'irregular', 'irrelevant', 'isolated', 'joint', 'jolly', 'joyful', 'judicial',
  'junior', 'just', 'keen', 'key', 'kind', 'kinetic', 'knowing', 'known',
  'labeled', 'laborious', 'lacking', 'large', 'late', 'latent', 'lateral',
  'latter', 'laughable', 'lawful', 'leading', 'leakproof', 'lean', 'learned',
  'least', 'leather', 'legal', 'legendary', 'legitimate', 'leisure', 'less',
  'level', 'liable', 'liberal', 'light', 'likely', 'limited', 'linear',
  'linguistic', 'liquid', 'literal', 'literary', 'little', 'live', 'lively',
  'living', 'local', 'locate', 'logical', 'lonely', 'long', 'loose', 'loud',
  'lovely', 'low', 'loyal', 'lucky', 'luminous', 'mad', 'magic', 'magical',
  'magnificent', 'main', 'major', 'male', 'mandatory', 'manifest', 'manual',
  'marginal', 'marine', 'marked', 'married', 'marvelous', 'masculine',
  'massive', 'master', 'matching', 'material', 'maternal', 'mathematical',
  'mature', 'maximum', 'meaningful', 'meaningless', 'mechanical', 'medical',
  'medieval', 'mediocre', 'medium', 'melodic', 'memorable', 'mental',
  'merciful', 'mere', 'middle', 'mighty', 'mild', 'military', 'minimal',
  'minimum', 'minor', 'miraculous', 'miserable', 'misleading', 'missing',
  'mixed', 'mobile', 'moderate', 'modern', 'modest', 'molecular', 'momentary',
  'monetary', 'monumental', 'moral', 'mortal', 'mother', 'motivational',
  'moving', 'multiple', 'municipal', 'musical', 'mutual', 'mysterious',
  'naive', 'naked', 'narrow', 'national', 'native', 'natural', 'nautical',
  'neat', 'necessary', 'negative', 'negligible', 'nervous', 'net', 'neutral',
  'new', 'nice', 'noble', 'noisy', 'nominal', 'nonprofit', 'normal', 'northern',
  'notable', 'notorious', 'novel', 'nuclear', 'null', 'numerical', 'numerous',
  'nutritional', 'obedient', 'objective', 'obligatory', 'obscure',
  'observant', 'obsolete', 'obvious', 'occasional', 'occupational', 'odd',
  'official', 'old', 'ominous', 'ongoing', 'online', 'open', 'operational',
  'opponent', 'opportunistic', 'opposite', 'optimal', 'optimistic', 'optional',
  'oral', 'ordinary', 'organic', 'organizational', 'oriental', 'original',
  'orthodox', 'outdoor', 'outer', 'outgoing', 'outrageous', 'outstanding',
  'overall', 'overseas', 'overwhelming', 'painful', 'pale', 'parallel',
  'paramount', 'parental', 'partial', 'particular', 'passionate', 'passive',
  'patient', 'patriotic', 'peaceful', 'peculiar', 'pediatric', 'peer',
  'penal', 'pending', 'perceivable', 'perceptible', 'perfect', 'periodic',
  'permanent', 'permissible', 'perpetual', 'persistent', 'personal',
  'persuasive', 'pessimistic', 'petty', 'philosophical', 'physical', 'pious',
  'plain', 'planetary', 'plausible', 'pleasant', 'plentiful', 'plural',
  'poetic', 'pointed', 'polar', 'polite', 'political', 'poor', 'popular',
  'populous', 'portable', 'positive', 'possible', 'postwar', 'potential',
  'powerful', 'powerless', 'practical', 'pragmatic', 'precious', 'precise',
  'predictable', 'predominant', 'preferable', 'preliminary', 'premier',
  'premium', 'prepared', 'present', 'presidential', 'prevalent', 'previous',
  'primary', 'prime', 'primitive', 'principal', 'prior', 'private',
  'privileged', 'probable', 'problematic', 'procedural', 'productive',
  'professional', 'proficient', 'profitable', 'profound', 'progressive',
  'prolific', 'prominent', 'promising', 'prompt', 'proper', 'prophetic',
  'proportional', 'prospective', 'prosperous', 'protective', 'proud',
  'provisional', 'psychological', 'public', 'pure', 'purposeful', 'quaint',
  'qualified', 'qualitative', 'quantitative', 'quick', 'quiet', 'radical',
  'radioactive', 'random', 'rapid', 'rare', 'rational', 'raw', 'reactive',
  'ready', 'real', 'realistic', 'reasonable', 'reassuring', 'recent',
  'receptive', 'reckless', 'recognizable', 'recurrent', 'redundant',
  'referential', 'refined', 'reflective', 'regional', 'registered', 'regular',
  'regulatory', 'reinforced', 'relative', 'relentless', 'relevant', 'reliable',
  'religious', 'reluctant', 'remarkable', 'remote', 'renowned', 'reputable',
  'requisite', 'resident', 'residential', 'residual', 'resilient', 'resolute',
  'respectable', 'respective', 'responsible', 'responsive', 'restless',
  'restrictive', 'retail', 'revolutionary', 'rewarding', 'rich', 'ridiculous',
  'right', 'rigid', 'rigorous', 'robust', 'romantic', 'rough', 'round',
  'routine', 'royal', 'rude', 'ruined', 'rural', 'sacred', 'sad', 'safe',
  'salient', 'same', 'sane', 'satisfactory', 'savage', 'saving', 'scarce',
  'scared', 'scary', 'scientific', 'seasonal', 'second', 'secondary', 'secret',
  'secular', 'secure', 'selective', 'selfish', 'semantic', 'senior', 'sensible',
  'sensitive', 'sensory', 'sentimental', 'separate', 'sequential', 'serial',
  'serious', 'severe', 'shallow', 'sharp', 'sheer', 'short', 'sick',
  'significant', 'silent', 'silky', 'silly', 'similar', 'simple', 'sincere',
  'single', 'singular', 'skeptical', 'skillful', 'skinny', 'slight', 'slim',
  'slow', 'small', 'smart', 'smooth', 'so-called', 'social', 'societal',
  'soft', 'sole', 'solemn', 'solid', 'solitary', 'solo', 'sophisticated',
  'sore', 'sorry', 'sound', 'sour', 'southern', 'sovereign', 'spacious',
  'spare', 'spatial', 'special', 'specific', 'spectacular', 'speculative',
  'speedy', 'spiritual', 'splendid', 'spontaneous', 'sporting', 'spotless',
  'stable', 'standard', 'startling', 'static', 'statistical', 'status',
  'steady', 'steep', 'stellar', 'stern', 'sticky', 'stiff', 'still', 'stimulating',
  'stout', 'straight', 'straightforward', 'strange', 'strategic', 'strict',
  'striking', 'stringent', 'strong', 'structural', 'stubborn', 'stunning',
  'stupid', 'stylish', 'subjective', 'subsequent', 'subsidiary', 'substantial',
  'subtle', 'successful', 'successive', 'sudden', 'sufficient', 'suitable',
  'super', 'superb', 'superficial', 'superior', 'supplementary', 'supportive',
  'supreme', 'sure', 'surgical', 'surplus', 'surprised', 'surprising',
  'surrounding', 'susceptible', 'suspicious', 'sustainable', 'sweet', 'swift',
  'sympathetic', 'systematic', 'tactical', 'talented', 'tall', 'tangible',
  'tasteful', 'technical', 'technological', 'tedious', 'temporary', 'tender',
  'tense', 'tentative', 'terrible', 'terrific', 'therapeutic', 'thick',
  'thin', 'thirsty', 'thorough', 'threatening', 'thrifty', 'thrilled',
  'tight', 'timely', 'tiny', 'tired', 'tiresome', 'tolerant', 'top', 'total',
  'tough', 'toxic', 'traditional', 'tragic', 'transparent', 'tremendous',
  'tribal', 'tricky', 'trivial', 'true', 'trustworthy', 'typical', 'ultimate',
  'unacceptable', 'unanimous', 'uncertain', 'uncomfortable', 'uncommon',
  'unconscious', 'underground', 'understandable', 'unequal', 'uneven',
  'unexpected', 'unfair', 'unfamiliar', 'unfavorable', 'unfortunate',
  'uniform', 'unique', 'universal', 'unknown', 'unlawful', 'unlikely',
  'unnecessary', 'unpleasant', 'unprecedented', 'unpredictable', 'unreasonable',
  'unstable', 'unsuccessful', 'unusual', 'unwelcome', 'upper', 'upset',
  'urban', 'urgent', 'useful', 'useless', 'usual', 'vacant', 'vague', 'valid',
  'valuable', 'variable', 'varied', 'various', 'vast', 'verbal', 'versatile',
  'vertical', 'viable', 'vibrant', 'vicious', 'victorious', 'vigorous',
  'violent', 'virtual', 'visible', 'visual', 'vital', 'vivid', 'vocal',
  'voluntary', 'vulnerable', 'warm', 'wasteful', 'watchful', 'weak', 'wealthy',
  'weary', 'welcome', 'wet', 'whole', 'wicked', 'wide', 'widespread', 'wild',
  'willing', 'wise', 'wonderful', 'wooden', 'working', 'worldwide', 'worth',
  'worthwhile', 'worthy', 'wounded', 'wrong', 'yielding', 'young', 'youthful',
  'zealous'
];

// Initialize Set for O(1) membership lookup
export const ENGLISH_CORE_LEXICON = new Set<string>(
  RAW_LEXICON_WORDS.map(w => w.toLowerCase().trim())
);

/**
 * Checks whether an English stem can be derived from the surface token
 * using standard morphological rules (stripping -ing, -ed, -s, -es, -ly, -tion, etc.)
 */
export function matchEnglishMorphology(token: string): {
  isEnglish: boolean;
  stem?: string;
  ruleApplied?: string;
} {
  const lower = token.toLowerCase().trim();

  // 1. Direct exception defense: if it ends in "ge" and is in ENGLISH_GE_EXCEPTIONS
  if (ENGLISH_GE_EXCEPTIONS.has(lower)) {
    return { isEnglish: true, stem: lower, ruleApplied: 'lexical_ge_exception' };
  }

  // 2. Direct core lexicon match
  if (ENGLISH_CORE_LEXICON.has(lower)) {
    return { isEnglish: true, stem: lower, ruleApplied: 'exact_lexicon' };
  }

  // 3. Morphological Stemming Pipeline:
  // Candidate derivations
  const candidates: Array<{ stem: string; rule: string }> = [];

  // -ing (e.g., 'working' -> 'work', 'testing' -> 'test', 'running' -> 'run', 'writing' -> 'write')
  if (lower.endsWith('ing') && lower.length > 5) {
    const base = lower.slice(0, -3);
    candidates.push({ stem: base, rule: 'gerund_ing' });
    candidates.push({ stem: base + 'e', rule: 'gerund_ing_e' }); // 'writing' -> 'write'
    // Geminate consonant reduction: 'stopping' -> 'stop'
    if (base.length > 2 && base[base.length - 1] === base[base.length - 2]) {
      candidates.push({ stem: base.slice(0, -1), rule: 'gerund_ing_degeminate' });
    }
  }

  // -ed (e.g., 'worked' -> 'work', 'created' -> 'create', 'stopped' -> 'stop')
  if (lower.endsWith('ed') && lower.length > 4) {
    const base = lower.slice(0, -2);
    candidates.push({ stem: base, rule: 'past_ed' });
    candidates.push({ stem: base + 'e', rule: 'past_ed_e' });
    if (base.length > 2 && base[base.length - 1] === base[base.length - 2]) {
      candidates.push({ stem: base.slice(0, -1), rule: 'past_ed_degeminate' });
    }
  }

  // -s / -es / -ies (e.g., 'classes' -> 'class', 'queries' -> 'query', 'files' -> 'file')
  if (lower.endsWith('ies') && lower.length > 4) {
    candidates.push({ stem: lower.slice(0, -3) + 'y', rule: 'plural_ies' });
  } else if (lower.endsWith('es') && lower.length > 4) {
    candidates.push({ stem: lower.slice(0, -2), rule: 'plural_es' });
    candidates.push({ stem: lower.slice(0, -1), rule: 'plural_s_on_e' });
  } else if (lower.endsWith('s') && !lower.endsWith('ss') && lower.length > 3) {
    candidates.push({ stem: lower.slice(0, -1), rule: 'plural_s' });
  }

  // -ly (e.g., 'quickly' -> 'quick', 'daily' -> 'day')
  if (lower.endsWith('ly') && lower.length > 4) {
    candidates.push({ stem: lower.slice(0, -2), rule: 'adverb_ly' });
  }

  // -tion / -sion (e.g., 'presentation' -> 'present', 'collection' -> 'collect')
  if (lower.endsWith('tion') && lower.length > 6) {
    const base = lower.slice(0, -4);
    candidates.push({ stem: base + 't', rule: 'noun_tion_t' });
    candidates.push({ stem: base + 'te', rule: 'noun_tion_te' });
    candidates.push({ stem: base, rule: 'noun_tion' });
  }

  // -ment (e.g., 'assignment' -> 'assign', 'development' -> 'develop')
  if (lower.endsWith('ment') && lower.length > 6) {
    candidates.push({ stem: lower.slice(0, -4), rule: 'noun_ment' });
  }

  // -able / -ible (e.g., 'readable' -> 'read', 'acceptable' -> 'accept')
  if ((lower.endsWith('able') || lower.endsWith('ible')) && lower.length > 6) {
    candidates.push({ stem: lower.slice(0, -4), rule: 'adj_able' });
    candidates.push({ stem: lower.slice(0, -4) + 'e', rule: 'adj_able_e' });
  }

  // -er / -or (e.g., 'manager' -> 'manage', 'worker' -> 'work')
  if ((lower.endsWith('er') || lower.endsWith('or')) && lower.length > 4) {
    const base = lower.slice(0, -2);
    candidates.push({ stem: base, rule: 'agent_er' });
    candidates.push({ stem: base + 'e', rule: 'agent_er_e' });
  }

  // Test candidates against English lexicon
  for (const cand of candidates) {
    if (ENGLISH_CORE_LEXICON.has(cand.stem) || ENGLISH_GE_EXCEPTIONS.has(cand.stem)) {
      return {
        isEnglish: true,
        stem: cand.stem,
        ruleApplied: cand.rule,
      };
    }
  }

  return { isEnglish: false };
}
