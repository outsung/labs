export interface Lab {
  id: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  reference?: string;
  status: "active" | "wip" | "archived";
}
