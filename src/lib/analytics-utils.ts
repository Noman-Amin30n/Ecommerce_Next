export interface GroupFormat {
  year: object | string | number;
  month: object | string | number;
  day?: object | string | number;
  hour?: object | string | number;
}

interface LocalParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  [key: string]: number;
}

interface LocalInfo {
  year: string;
  month: string;
  day: string;
  hour: string;
  [key: string]: string;
}

export function getDateRanges(timeRange: string, timezone: string = "UTC") {
  const now = new Date();

  const getLocalParts = (date: Date): LocalParts => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const p: Partial<LocalParts> = {};
    parts.forEach(({ type, value }) => {
      if (type !== "literal") {
        p[type as keyof LocalParts] = parseInt(value);
      }
    });
    return p as LocalParts;
  };

  const lp = getLocalParts(now);

  let startDate: Date;
  let previousStartDate: Date;
  let groupFormat: GroupFormat;

  const tzAttr = { date: "$computedCreatedAt", timezone };

  switch (timeRange) {
    case "today":
    case "daily":
      const localDayStartStr = `${lp.year}-${String(lp.month).padStart(2, "0")}-${String(lp.day).padStart(2, "0")}T00:00:00`;
      const dummy = new Date(
        now.toLocaleString("en-US", { timeZone: timezone }),
      );
      const offset = dummy.getTime() - now.getTime();
      startDate = new Date(new Date(localDayStartStr).getTime() - offset);

      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 1);

      groupFormat = {
        year: { $year: tzAttr },
        month: { $month: tzAttr },
        day: { $dayOfMonth: tzAttr },
        hour: { $hour: tzAttr },
      };
      break;

    case "weekly":
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 7);
      groupFormat = {
        year: { $year: tzAttr },
        month: { $month: tzAttr },
        day: { $dayOfMonth: tzAttr },
      };
      break;

    case "monthly":
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 30);
      groupFormat = {
        year: { $year: tzAttr },
        month: { $month: tzAttr },
        day: { $dayOfMonth: tzAttr },
      };
      break;

    case "yearly":
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 12);
      previousStartDate = new Date(startDate);
      previousStartDate.setMonth(previousStartDate.getMonth() - 12);
      groupFormat = {
        year: { $year: tzAttr },
        month: { $month: tzAttr },
      };
      break;

    default:
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 30);
      groupFormat = {
        year: { $year: tzAttr },
        month: { $month: tzAttr },
        day: { $dayOfMonth: tzAttr },
      };
  }

  return { startDate, previousStartDate, groupFormat };
}

export function generateLabels(
  timeRange: string,
  startDate: Date,
  timezone: string,
) {
  const allLabels: { key: string; label: string }[] = [];
  const now = new Date();

  const getLocalInfo = (date: Date): LocalInfo => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const p: Partial<LocalInfo> = {};
    parts.forEach(({ type, value }) => {
      if (type !== "literal") {
        p[type as keyof LocalInfo] = value;
      }
    });
    return p as LocalInfo;
  };

  if (timeRange === "daily" || timeRange === "today") {
    for (let i = 0; i < 24; i++) {
      const d = new Date(startDate.getTime() + i * 3600000);
      const info = getLocalInfo(d);
      const key = `${info.year}-${info.month.padStart(2, "0")}-${info.day.padStart(2, "0")}-${info.hour.padStart(2, "0")}`;
      allLabels.push({ key, label: `${parseInt(info.hour)}:00` });
    }
  } else if (timeRange === "weekly" || timeRange === "monthly") {
    const days = timeRange === "weekly" ? 7 : 30;
    for (let i = 0; i <= days; i++) {
      const d = new Date(startDate.getTime() + i * 86400000);
      if (d > now) break;
      const info = getLocalInfo(d);
      const key = `${info.year}-${info.month.padStart(2, "0")}-${info.day.padStart(2, "0")}`;
      allLabels.push({
        key,
        label: `${parseInt(info.day)}/${parseInt(info.month)}`,
      });
    }
  } else if (timeRange === "yearly") {
    for (let i = 0; i < 12; i++) {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + i + 1);
      const info = getLocalInfo(d);
      const key = `${info.year}-${info.month.padStart(2, "0")}`;
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      allLabels.push({ key, label: monthNames[parseInt(info.month) - 1] });
    }
  }

  return allLabels;
}
