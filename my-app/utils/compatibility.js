import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const allInterests = [
    "abstract concepts",
    "abstract problem solving",
    "adventure",
    "analysis",
    "animals",
    "art and aesthetics",
    "art and design",
    "artificial intelligence",
    "authentic self-expression",
    "bookkeeping",
    "brainstorming ideas",
    "building and fixing",
    "business logistics",
    "business strategy",
    "business ventures",
    "caregiving",
    "coding and algorithms",
    "community leadership",
    "community organization",
    "community service",
    "competition",
    "complex games (e.g. chess, Go)",
    "conflict resolution",
    "content creation",
    "crafting",
    "creative problem solving",
    "creative writing",
    "data analysis",
    "data organization",
    "daydreaming",
    "debate",
    "documentaries",
    "docuseries",
    "DIY projects",
    "educating others",
    "education",
    "emerging technologies",
    "emotional expression",
    "emotional intelligence",
    "emotional support",
    "emotional support systems",
    "entertainment",
    "entrepreneurship",
    "ethical philosophy",
    "event hosting",
    "event organization",
    "event planning",
    "existential questions",
    "family and home life",
    "family leadership",
    "family traditions",
    "fast-paced environments",
    "fashion",
    "fashion and beauty",
    "finance",
    "financial management",
    "financial planning",
    "financial systems",
    "freedom of choice",
    "friendship building",
    "future forecasting",
    "government and civics",
    "group activities",
    "group dynamics",
    "hands-on creativity",
    "health and wellness",
    "historical accuracy",
    "historical fiction",
    "history",
    "home decoration",
    "hospitality",
    "human behavior",
    "improv and acting",
    "individual identity",
    "individualism",
    "independent action",
    "independent research",
    "independent study",
    "innovation",
    "intellectual challenges",
    "interior design",
    "journaling",
    "law and order",
    "learning new tools",
    "leadership",
    "leadership development",
    "life coaching",
    "literature",
    "living in the moment",
    "loyalty and service",
    "lifestyle aesthetics",
    "lifestyle design",
    "management",
    "martial arts",
    "marketing and branding",
    "mechanics",
    "mental health awareness",
    "mentorship",
    "motorcycles and cars",
    "motivational speaking",
    "music and dance",
    "music composition",
    "music with emotional depth",
    "mythology",
    "natural beauty",
    "nature and animals",
    "negotiation",
    "networking",
    "new experiences",
    "nonprofit work",
    "operational efficiency",
    "party planning",
    "personal development",
    "personal growth",
    "personal storytelling",
    "philosophical debates",
    "philosophy",
    "photography",
    "poetry",
    "practical challenges",
    "practical knowledge",
    "problem solving",
    "problem troubleshooting",
    "procedures and policies",
    "productivity systems",
    "project management",
    "project tracking",
    "psychology",
    "psychotherapy",
    "public speaking",
    "public relations",
    "quality assurance",
    "relationship psychology",
    "risk and reward",
    "risk management",
    "risk-taking",
    "routine-based hobbies",
    "sales and marketing",
    "science and technology",
    "self-expression",
    "social causes",
    "social dynamics",
    "social etiquette",
    "socializing",
    "spirituality",
    "sports",
    "sports coaching",
    "startup culture",
    "storytelling",
    "storytelling with morals",
    "strategic thinking",
    "structured debate",
    "survival skills",
    "symbolism",
    "systems and logic",
    "systems design",
    "tactical planning",
    "tactical strategy",
    "task completion",
    "teaching and caregiving",
    "team bonding",
    "team building",
    "team coordination",
    "technology gadgets",
    "technology trends",
    "time management",
    "tradition",
    "traditional knowledge",
    "traditional structures",
    "travel",
    "travel and cultures",
    "trendspotting",
    "volunteer work",
    "volunteering",
    "visual art",
    "vision planning",
    "woodworking",
    "writing",
    "writing and journaling",
    "writing inspirational content",
    "writing theory-based content"
  ];
  
const { user } = useAuth();

// Cosine similarity calculation
const cosineSimilarity = (vecA, vecB) => {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a ** 2, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b ** 2, 0));
  return magA && magB ? dot / (magA * magB) : 0;
};

// Jaccard similarity
const jaccardSimilarity = (a, b) => {
  const intersection = a.filter(i => b.includes(i));
  const union = Array.from(new Set([...a, ...b]));
  return intersection.length / union.length;
};

// Convert interests to a vector for cosine similarity
const toVector = (userInterests, all) => all.map(interest => userInterests.includes(interest) ? 1 : 0);

// Calculate interest compatibility
const sharedInterestsCompatibility = (a, b, all) => {
  const jac = jaccardSimilarity(a, b);
  const vecA = toVector(a, all);
  const vecB = toVector(b, all);
  const cos = cosineSimilarity(vecA, vecB);
  return (jac + cos) / 2;
};

// MBTI compatibility score
const mbtiCompatibilityScore = (a, b) => {
  if (a === b) return 1;
  let match = 0;
  for (let i = 0; i < 4; i++) if (a[i] === b[i]) match++;
  return match / 4;
};

// Main function to calculate compatibility
export const calculateCompatibility = async (user, targetId) => {
  const { data: currentUser } = await supabase
    .from('profiles')
    .select('mbti_type_id, mbti_types (type), selected_interests')
    .eq('id', user.id)
    .single();

  const { data: viewedUser } = await supabase
    .from('profiles')
    .select('mbti_type_id, mbti_types (type), selected_interests')
    .eq('id', targetId)
    .single();

  if (!currentUser || !viewedUser) return null;

  const mbtiScore = mbtiCompatibilityScore(currentUser.mbti, viewedUser.mbti);
  const interestScore = sharedInterestsCompatibility(currentUser.interests || [], viewedUser.interests || [], allInterests);
  const finalScore = ((mbtiScore + interestScore) / 2) * 100;

  return finalScore.toFixed(1); // Return percentage-like score
};
