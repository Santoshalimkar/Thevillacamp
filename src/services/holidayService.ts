import { API_BASE_URL } from "./api";

export interface IndianHoliday {
  date: string; // YYYY-MM-DD
  name: string;
  isPublic?: boolean;
}

export interface LongWeekendItem {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  holidayNames: string[];
}

export interface HolidayQuickCard {
  id: string;
  name: string;
  type: string;
  totalDays: number;
  startDate: string;
  endDate: string;
  dateRange: string;
  isLw: boolean;
}

// Built-in Indian Gazetted Holidays for instant zero-latency offline rendering
export const STATIC_GAZETTED_HOLIDAYS: IndianHoliday[] = [
  { date: "2026-01-01", name: "New Year's Day", isPublic: true },
  { date: "2026-01-14", name: "Makar Sankranti / Pongal", isPublic: false },
  { date: "2026-01-26", name: "Republic Day", isPublic: true },
  { date: "2026-02-15", name: "Maha Shivratri", isPublic: true },
  { date: "2026-03-04", name: "Holi", isPublic: true },
  { date: "2026-03-21", name: "Eid-ul-Fitr (Ramzan Id)", isPublic: true },
  { date: "2026-03-26", name: "Rama Navami", isPublic: true },
  { date: "2026-03-31", name: "Mahavir Jayanti", isPublic: true },
  { date: "2026-04-03", name: "Good Friday", isPublic: true },
  { date: "2026-04-14", name: "Dr. B.R. Ambedkar Jayanti", isPublic: true },
  { date: "2026-05-01", name: "Maharashtra Day / Labour Day", isPublic: true },
  { date: "2026-05-28", name: "Bakrid / Eid-ul-Adha", isPublic: true },
  { date: "2026-06-26", name: "Muharram", isPublic: true },
  { date: "2026-08-15", name: "Independence Day", isPublic: true },
  { date: "2026-08-26", name: "Milad un-Nabi", isPublic: true },
  { date: "2026-09-04", name: "Janmashtami", isPublic: true },
  { date: "2026-09-14", name: "Ganesh Chaturthi", isPublic: true },
  { date: "2026-10-02", name: "Mahatma Gandhi Jayanti", isPublic: true },
  { date: "2026-10-17", name: "First Day of Durga Puja", isPublic: false },
  { date: "2026-10-20", name: "Dussehra (Vijayadashami)", isPublic: true },
  { date: "2026-11-08", name: "Diwali (Deepavali)", isPublic: true },
  { date: "2026-11-24", name: "Guru Nanak Jayanti", isPublic: true },
  { date: "2026-12-23", name: "Hazarat Ali's Birthday", isPublic: false },
  { date: "2026-12-25", name: "Christmas", isPublic: true },
  { date: "2027-01-26", name: "Republic Day", isPublic: true },
  { date: "2027-03-22", name: "Holi", isPublic: true },
];

export const STATIC_LONG_WEEKENDS: LongWeekendItem[] = [
  {
    id: "lw-durga-puja",
    title: "Durga Puja Long Weekend",
    startDate: "2026-10-17",
    endDate: "2026-10-20",
    totalDays: 4,
    holidayNames: ["First Day of Durga Puja", "Dussehra"],
  },
  {
    id: "lw-hazarat-ali",
    title: "Hazarat Ali Year-End Weekend",
    startDate: "2026-12-23",
    endDate: "2026-12-27",
    totalDays: 5,
    holidayNames: ["Hazarat Ali's Birthday", "Christmas"],
  },
  {
    id: "lw-rep-day",
    title: "Republic Day Long Weekend",
    startDate: "2026-01-24",
    endDate: "2026-01-26",
    totalDays: 3,
    holidayNames: ["Republic Day"],
  },
  {
    id: "lw-good-friday",
    title: "Good Friday Easter Weekend",
    startDate: "2026-04-03",
    endDate: "2026-04-05",
    totalDays: 3,
    holidayNames: ["Good Friday"],
  },
  {
    id: "lw-maha-day",
    title: "Maharashtra Day Weekend",
    startDate: "2026-05-01",
    endDate: "2026-05-03",
    totalDays: 3,
    holidayNames: ["Maharashtra Day"],
  },
  {
    id: "lw-gandhi-jayanti",
    title: "Gandhi Jayanti Long Weekend",
    startDate: "2026-10-02",
    endDate: "2026-10-05",
    totalDays: 4,
    holidayNames: ["Mahatma Gandhi Jayanti"],
  },
  {
    id: "lw-christmas",
    title: "Christmas Year-End Getaway",
    startDate: "2026-12-25",
    endDate: "2026-12-27",
    totalDays: 3,
    holidayNames: ["Christmas"],
  },
];

export class HolidayService {
  private static holidayMap: Record<string, string> = {};
  private static longWeekendDatesSet = new Set<string>();
  private static longWeekendsList: LongWeekendItem[] = [...STATIC_LONG_WEEKENDS];
  private static allHolidaysList: IndianHoliday[] = [...STATIC_GAZETTED_HOLIDAYS];
  private static initialized = false;

  public static init() {
    if (this.initialized) return;
    this.populateStaticData();
    this.fetchRemoteHolidays(new Date().getFullYear());
    this.initialized = true;
  }

  private static populateStaticData() {
    STATIC_GAZETTED_HOLIDAYS.forEach((h) => {
      this.holidayMap[h.date] = h.name;
    });

    STATIC_LONG_WEEKENDS.forEach((lw) => {
      const curr = new Date(lw.startDate);
      const end = new Date(lw.endDate);
      while (curr <= end) {
        const y = curr.getFullYear();
        const m = String(curr.getMonth() + 1).padStart(2, "0");
        const d = String(curr.getDate()).padStart(2, "0");
        this.longWeekendDatesSet.add(`${y}-${m}-${d}`);
        curr.setDate(curr.getDate() + 1);
      }
    });
  }

  private static async fetchRemoteHolidays(year: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/User/holidays/long-weekends?year=${year}`);
      if (!response.ok) return;
      const json = await response.json();
      if (json.success && json.data) {
        if (Array.isArray(json.data.allHolidays) && json.data.allHolidays.length > 0) {
          this.allHolidaysList = json.data.allHolidays;
          json.data.allHolidays.forEach((h: IndianHoliday) => {
            this.holidayMap[h.date] = h.name;
          });
        }
        if (Array.isArray(json.data.longWeekends) && json.data.longWeekends.length > 0) {
          this.longWeekendsList = json.data.longWeekends;
        }
        if (Array.isArray(json.data.longWeekendDates)) {
          json.data.longWeekendDates.forEach((d: string) => this.longWeekendDatesSet.add(d));
        }
      }
    } catch {
      // Gracefully continue with static holidays
    }
  }

  public static isHoliday(dateStr: string): boolean {
    this.init();
    return Boolean(this.holidayMap[dateStr]);
  }

  public static getHolidayName(dateStr: string): string | null {
    this.init();
    return this.holidayMap[dateStr] || null;
  }

  public static isLongWeekend(dateStr: string): boolean {
    this.init();
    return this.longWeekendDatesSet.has(dateStr);
  }

  public static getLongWeekends(): LongWeekendItem[] {
    this.init();
    return this.longWeekendsList;
  }

  public static getUpcomingQuickCards(): HolidayQuickCard[] {
    this.init();
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const todayStr = `${y}-${m}-${d}`;

    const cards: HolidayQuickCard[] = [];

    // 1. Long weekends
    this.longWeekendsList.forEach((lw) => {
      if (lw.endDate >= todayStr) {
        const startFormatted = this.formatShortMonthDay(lw.startDate);
        const endFormatted = this.formatShortMonthDay(lw.endDate);
        cards.push({
          id: lw.id,
          name: lw.holidayNames?.[0] || lw.title,
          type: `${lw.totalDays} Days`,
          totalDays: lw.totalDays,
          startDate: lw.startDate,
          endDate: lw.endDate,
          dateRange: `${startFormatted} – ${endFormatted}`,
          isLw: true,
        });
      }
    });

    // 2. Individual gazetted holidays if not already covered
    this.allHolidaysList.forEach((h) => {
      if (h.date >= todayStr && cards.length < 8) {
        const alreadyInLw = cards.some((c) => c.startDate <= h.date && c.endDate >= h.date);
        if (!alreadyInLw) {
          const nextDay = new Date(h.date);
          nextDay.setDate(nextDay.getDate() + 1);
          const nextDayStr = nextDay.toISOString().split("T")[0];

          cards.push({
            id: `hol-${h.date}`,
            name: h.name,
            type: "Gazetted",
            totalDays: 1,
            startDate: h.date,
            endDate: nextDayStr,
            dateRange: `${this.formatShortMonthDay(h.date)} – ${this.formatShortMonthDay(nextDayStr)}`,
            isLw: false,
          });
        }
      }
    });

    return cards.slice(0, 8);
  }

  private static formatShortMonthDay(dateStr: string): string {
    try {
      const parts = dateStr.split("-").map(Number);
      const dt = new Date(parts[0], parts[1] - 1, parts[2]);
      return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(dt);
    } catch {
      return dateStr;
    }
  }
}
