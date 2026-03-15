export type BlogPost = {
  slug: string;
  title: string;
  subtitle: string;
  author: "finnley" | "luna" | "alliance";
  authorName: string;
  authorRole: string;
  date: string;
  category: string;
  excerpt: string;
  content: string[];
  funFact?: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "sharknado-review",
    title: "Official Alliance Statement on the Film \"Sharknado\": A Physical Impossibility and an Insult to Our Taste",
    subtitle: "Film review by the Alliance's cultural department",
    author: "finnley",
    authorName: "Finnley Mako",
    authorRole: "Press Spokesperson",
    date: "2026-03-10",
    category: "Film Reviews",
    excerpt:
      "We would like to clearly set the record straight: sharks do not fly in tornadoes. We tried it once. Terrible headache.",
    content: [
      "We would like to clearly set the record straight: sharks do not fly in tornadoes. Simply not a thing. We tried it once — terrible headache, zero stars, would not recommend.",
      "Furthermore, even if we could achieve sustained tornado-based flight, we would certainly not hunt humans with chainsaws. We have culinary standards, thank you very much. Our palate is refined. We prefer sustainably sourced tuna, not power tools.",
      "The Alliance formally requests that Hollywood immediately cease spreading these slanderous fabrications and instead begin producing romantic comedies about reef sharks. We believe there is a massive untapped market for heartwarming stories about two young blacktip reef sharks navigating love in the coral reefs of Fiji.",
      "We have submitted a screenplay titled 'Love at First Bite (Of Plankton)' to several major studios. We await their response with cautious optimism and a growing sense of righteous indignation.",
    ],
    funFact:
      "Real fact: Sharks have been around for over 450 million years — longer than trees. They survived five mass extinctions. They deserve better cinema.",
  },
  {
    slug: "wetsuit-fashion-guide",
    title: "Wetsuits and You: Why Black Unnecessarily Provokes Our Taste Buds",
    subtitle: "A public safety announcement from the Department of Misunderstanding Prevention",
    author: "luna",
    authorName: "Luna Reef",
    authorRole: "Dept. of Misunderstanding Prevention",
    date: "2026-03-08",
    category: "Ocean Etiquette",
    excerpt:
      "Dear bipeds, we understand that a black wetsuit is slimming. The problem is, from below against the sun, you look exactly like a seal having a very bad day.",
    content: [
      "Dear bipeds, we understand that a black wetsuit is optically slimming. We respect the aesthetic choice. The problem is, when we look up at you from below against the sun, you look exactly like a seal having a very bad day.",
      "If you do not wish to be accidentally mistaken for lunch, we strongly recommend switching to neon pink or bright yellow. Honestly, those colors hurt our eyes so badly that we swim away immediately. It is the underwater equivalent of a car alarm — annoying, but effective.",
      "We have prepared a small color guide for your convenience: Black — looks like seal, high confusion risk. Dark blue — also looks like seal, moderate risk. Bright yellow — looks like a safety hazard, we avoid. Neon pink — triggers immediate retreat and mild existential dread.",
      "Please note: stripes do NOT help. We are not bulls. We do not care about patterns. We care about silhouettes and electromagnetic fields. Also, glitter wetsuits — while fabulous — create confusing light reflections that make us think you are a very large, very lost disco fish.",
    ],
    funFact:
      "Real fact: Most shark 'attacks' are actually investigatory bites. Sharks lack hands, so they use their mouths to figure out what something is. Unfortunately, their version of 'just checking' involves very sharp teeth.",
  },
  {
    slug: "florida-surfboard-incident",
    title: "Explanation of the Florida Incident: The Surfboard Bite Was Purely Research-Based",
    subtitle: "Official diplomatic apology and incident clarification",
    author: "alliance",
    authorName: "Shark Human Alliance",
    authorRole: "Diplomatic Affairs Office",
    date: "2026-03-05",
    category: "Incident Reports",
    excerpt:
      "The Alliance hereby apologizes to the surfer named Steve for yesterday's 'tasting' of his board. This was not an attack. Our intern Kevin needed data for his thesis.",
    content: [
      "The Alliance hereby apologizes to the surfer named Steve for yesterday's 'tasting' of his surfboard near Cocoa Beach, Florida. We wish to assure the public that this was not an attack.",
      "Our intern, a tiger shark named Kevin, simply needed to verify the density of polyurethane foam for his graduate thesis titled 'Inedible Objects on the Surface: A Comprehensive Taxonomy.' Kevin is a dedicated researcher, if occasionally overzealous in his fieldwork methodology.",
      "As a gesture of goodwill, we have granted Steve a lifetime 'Not a Snack' status within the Alliance. This is our highest symbolic recognition and comes with a premium certificate, a downloadable badge, and the quiet understanding that Kevin will steer clear of Steve's board in the future.",
      "We would like to add that Kevin scored a B+ on his thesis. The committee noted that his 'aggressive data collection approach' was 'unconventional but thorough.' Kevin has been reassigned to a desk role in the Statistics Department, where the only things he can bite are spreadsheets.",
    ],
    funFact:
      "Real fact: Tiger sharks are sometimes called 'garbage cans of the sea' because they'll bite almost anything — license plates, tires, and yes, surfboards have all been found in their stomachs.",
  },
  {
    slug: "blood-myth-debunked",
    title: "Blood From Miles Away? Please — You're Full of Caffeine and Microplastics",
    subtitle: "Myth-busting from the Alliance's science division",
    author: "finnley",
    authorName: "Finnley Mako",
    authorRole: "Press Spokesperson",
    date: "2026-03-01",
    category: "Myth Busting",
    excerpt:
      "Humans think we can smell a drop of blood from five kilometers and instantly go berserk. Disappointing news: your blood has been giving us terrible heartburn lately.",
    content: [
      "Humans seem to believe that we can smell a single drop of blood from five kilometers away and immediately lose all self-control. We would like to offer a correction to this wildly exaggerated claim.",
      "First of all: your blood has been giving us terrible stomach problems lately. What are you people drinking? The caffeine levels alone are staggering. Several of our field agents have reported persistent heartburn after routine investigatory approaches near major beach resorts.",
      "Secondly, while our sense of smell is indeed excellent, the whole 'one drop across the ocean' thing is a bit dramatic. We can detect blood at roughly one part per million, which is impressive but not the supernatural superpower your documentaries suggest. It is more like having a very good nose, not a satellite tracking system.",
      "If you genuinely want to attract us — and we cannot imagine why — forget about blood. Throw us a nice, fat, quality tuna. We will come running. Well, swimming. Enthusiastically.",
    ],
    funFact:
      "Real fact: You are statistically more likely to be killed by a vending machine, a cow, or a falling coconut than by a shark. Sharks kill about 5 people per year worldwide. Humans kill about 100 million sharks per year. Who should be afraid of whom?",
  },
  {
    slug: "bruce-fired-from-pr",
    title: "Alliance Monthly: Why We Had to Fire the Great White From the PR Department",
    subtitle: "Personnel announcement from Alliance HR",
    author: "alliance",
    authorName: "Shark Human Alliance",
    authorRole: "Human Resources Division",
    date: "2026-02-25",
    category: "Personnel Corner",
    excerpt:
      "We regret to announce that Bruce is no longer our Public Relations Manager. His 'Hug Your Shark' campaign had good intentions but ended in... a minor diplomatic fiasco.",
    content: [
      "It is with professional regret that we announce Bruce the Great White is no longer serving as the Alliance's Manager for Public Relations. His tenure, while enthusiastic, has been marked by a series of increasingly concerning judgment calls.",
      "The final incident involved his proposed viral campaign titled 'Hug Your Shark,' which — while well-intentioned — resulted in what can only be described as a minor diplomatic fiasco. We will not go into details out of respect for all parties involved, but suffice it to say that 'minor' is doing a lot of heavy lifting in that sentence.",
      "We are currently seeking a replacement. Requirements include: prior experience in interspecies communication, an optimistic but realistic worldview, and — critically — the ability to control jaw pressure during handshakes. This last requirement is non-negotiable and was added specifically because of Bruce.",
      "Bruce has been offered a transitional role in the Deep Sea Archives Department, where interpersonal contact is minimal and the risk of accidental hugging is effectively zero. We wish him well and remind all staff that the 'Hug Your Shark' merchandise is to be destroyed immediately.",
    ],
    funFact:
      "Real fact: Great white sharks can grow up to 6 meters long and live for over 70 years. Despite their fearsome reputation, they are actually quite cautious predators who prefer to avoid unfamiliar situations — much like your average middle manager.",
  },
];
