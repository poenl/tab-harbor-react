export interface SessionGroup {
  id: string;
  name: string;
  createdAt: string;
}

export interface SessionGroupsState {
  groups: SessionGroup[];
  assignments: Record<string, string>;
}

export interface GroupOrderState {
  sessionOrder: string[];
  pinnedOrder: string[];
  pinEnabled: boolean;
}
