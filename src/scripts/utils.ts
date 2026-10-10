// @filename: utils.ts
import humanizeDuration from "humanize-duration";

export function dynamicSort(property: string, isAscDesc: string) {
  return function (obj1: any, obj2: any) {
    const val1 =
      typeof obj1[property] === "string"
        ? obj1[property].toLowerCase()
        : obj1[property] ?? "";

    const val2 =
      typeof obj2[property] === "string"
        ? obj2[property].toLowerCase()
        : obj2[property] ?? "";

    if (isAscDesc === "DESC") {
      return val1 > val2 ? -1 : val1 < val2 ? 1 : 0;
    }

    return val1 > val2 ? 1 : val1 < val2 ? -1 : 0;
  };
}

export function buildList(selection: any, source: any) {
  const items: any[] = [];
  if (selection)
    selection.forEach(function (item: any) {
      const found = source.find((x: any) => x.id == item);
      if (found != null) items.push(found);
    });
  return items;
}

export function getDate(date: string) {
  if (date === null || date === undefined) {
    return undefined;
  } else {
    return new Date(date);
  }
}

export function getBool(value: any) {
  return value === null || value === undefined ? false : value;
}

export function dynamicSort(property: string, isAscDesc: string) {
  return function (obj1: any, obj2: any) {
    if (isAscDesc === "DESC") {
      return obj1[property] > obj2[property]
        ? -1
        : obj1[property] < obj2[property]
          ? 1
          : 0;
    }
    return obj1[property] > obj2[property]
      ? 1
      : obj1[property] < obj2[property]
        ? -1
        : 0;
  };
}

export function getMonthYear(date: Date) {
  if (date === null || date === undefined) {
    return "";
  } else {
    const dt = new Date(date);
    return (
      dt.toLocaleString("default", { month: "short" }) + " " + dt.getFullYear()
    );
  }
}

export function getMonths(d1: Date, d2: Date) {
  if (!d1) d1 = new Date();
  else d1 = new Date(d1.valueOf());

  if (!d2) d2 = new Date();
  else d2 = new Date(d2.valueOf());

  return humanizeDuration(d2.valueOf() - d1.valueOf(), {
    conjunction: " and ",
    units: ["y", "mo"],
    round: true,
  });
}
