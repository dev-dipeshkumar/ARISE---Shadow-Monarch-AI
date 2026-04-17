export interface Quest {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

export interface MonarchStats {
  strength: number;
  agility: number;
  intelligence: number;
  mana: number;
  shadowStrength: number;
}
