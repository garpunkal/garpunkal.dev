// @filename: utils.ts
import humanizeDuration from "humanize-duration";

export function dynamicSortMultiple(...args: string[]) {
  const sortCriteria: any[] = [];
  for (let i = 0; i < args.length; i++) {
    const splittedArg = args[i].split(/ +/);
    sortCriteria[sortCriteria.length] = [
      splittedArg[0],
      splittedArg[1] ? splittedArg[1].toUpperCase() : "ASC",
    ];
  }
  return function (obj1: any, obj2: any) {
    let i = 0,
      result = 0;
    const numberOfProperties = sortCriteria.length;
    while (result === 0 && i < numberOfProperties) {
      result = dynamicSort(sortCriteria[i][0], sortCriteria[i][1])(obj1, obj2);
      i++;
    }
    return result;
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
