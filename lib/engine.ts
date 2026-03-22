import bookingConfig from './bookingEngine.json';

// Type definitions
export type SessionState = 'start' | 'awaiting_date' | 'awaiting_time' | 'awaiting_confirmation' | 'awaiting_user_info' | 'completed' | 'done';

interface Session {
  state: SessionState;
  date?: string;
  time?: string;
  name?: string;
  phone?: string;
}

interface IntentMap {
  [key: string]: string[];
}

interface StateConfig {
  on_intent?: string;
  response: string;
  next?: SessionState;
  action?: string;
}

interface StatesConfig {
  [key: string]: StateConfig;
}

// Sessions storage (in-memory)
const sessions: Record<string, Session> = {};

// Intent Detection
function detectIntent(message: string): string | null {
  const msg = message.toLowerCase();
  const intents = bookingConfig.intents as IntentMap;

  for (const intent in intents) {
    if (intents[intent].some((word: string) => msg.includes(word))) {
      return intent;
    }
  }
  return null;
}

// Extract name + phone from message
function extractUserInfo(message: string): { name: string | null; phone: string | null } {
  // Match Bangladeshi phone number pattern (01X-XXXXXXXX)
  const phoneMatch = message.match(/01[3-9]\d{8}/);
  // Match name (first word that starts with letter)
  const nameMatch = message.match(/^([A-Za-z]+)/);

  return {
    name: nameMatch ? nameMatch[1] : null,
    phone: phoneMatch ? phoneMatch[0] : null,
  };
}

// Replace template variables
function fillTemplate(text: string, session: Session): string {
  return text
    .replace(/\{\{date\}\}/g, session.date || '')
    .replace(/\{\{time\}\}/g, session.time || '')
    .replace(/\{\{name\}\}/g, session.name || '');
}

// Get or create session
function getSession(userId: string): Session {
  if (!sessions[userId]) {
    sessions[userId] = { state: 'start' };
  }
  return sessions[userId];
}

// Main Engine Handler
export function handleMessage(userId: string, message: string): { reply: string; session: Session } {
  const session = getSession(userId);
  const states = bookingConfig.states as StatesConfig;
  const currentState = states[session.state];
  const intent = detectIntent(message);

  // Handle date selection
  if (session.state === 'awaiting_date') {
    session.date = message;
    session.state = currentState.next as SessionState;
    return { reply: currentState.response, session };
  }

  // Handle time selection
  if (session.state === 'awaiting_time') {
    session.time = message;
    session.state = currentState.next as SessionState;
    return { reply: fillTemplate(currentState.response, session), session };
  }

  // Handle user info
  if (session.state === 'awaiting_user_info') {
    const { name, phone } = extractUserInfo(message);

    if (!name || !phone) {
      return { 
        reply: "Please provide both name and valid phone number (e.g., 'Akash 01341196144').", 
        session 
      };
    }

    session.name = name;
    session.phone = phone;
    session.state = (currentState.next as SessionState) || 'done';

    return { reply: fillTemplate(currentState.response, session), session };
  }

  // Handle "completed" state transition
  if (session.state === 'completed') {
    session.state = 'done';
    return { reply: currentState.response, session };
  }

  // Handle intent-based transition
  if (intent && currentState.on_intent === intent) {
    session.state = currentState.next as SessionState;
    return { reply: currentState.response, session };
  }

  // Default response for unknown input
  return { 
    reply: "I didn't understand that. Could you please rephrase?", 
    session 
  };
}

// Reset session
export function resetSession(userId: string): void {
  sessions[userId] = { state: 'start' };
}

// Get current session state
export function getSessionState(userId: string): SessionState {
  return sessions[userId]?.state || 'start';
}
