export interface GammaMarket {
  id: string;
  conditionId: string;
  slug: string;
  question: string;
  outcomes: string;
  active: boolean;
  closed: boolean;
  enableOrderBook?: boolean;
  orderPriceMinTickSize?: number;
  orderMinSize?: number;
  negRisk?: boolean;
  clobTokenIds?: string;
  events?: Array<{ id?: string; slug: string; title?: string }>;
}

export interface GammaEventTag {
  id: string;
  label: string;
  slug: string;
}

export interface GammaEvent {
  id: string;
  slug: string;
  title: string;
  tags?: GammaEventTag[];
}
