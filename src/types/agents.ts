export interface Skill {
  name: string;
  description: string;
}

export interface AgentDef {
  slug: string;
  name: string;
  role: string;
  color: string;      // Tailwind color name, e.g. "indigo"
  colorHex: string;   // e.g. "#6366f1"
  description: string;
  skills: Skill[];
  owns: string[];     // file ownership summary lines
}
