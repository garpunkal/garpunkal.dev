// @filename: utils.ts
import humanizeDuration from "humanize-duration";

export function DynamicSortMultiple(...args: string[]) {
    const props: any[] = []
    for (var i = 0; i < args.length; i++) {
        var splittedArg = args[i].split(/ +/);
        props[props.length] = [splittedArg[0], (splittedArg[1] ? splittedArg[1].toUpperCase() : "ASC")];
    }
    return function (obj1: any, obj2: any) {
        var i = 0, result = 0, numberOfProperties = props.length;
        while (result === 0 && i < numberOfProperties) {
            result = DynamicSort(props[i][0], props[i][1])(obj1, obj2);
            i++;
        }
        return result;
    }
}

export function BuildList(selection: any, source: any) {
    const items: any[] = []
    if (selection)
        selection.forEach(function (item: any) {
            const found = source.find((x: any) => x.id == item);
            if (found != null) items.push(found);
        });
    return items;
}

export function GetDate(date: string) {
    if (date === null || date === undefined) {
        return undefined;
    } else {
        return new Date(date);
    }
}

export function GetBool(value: any) {
    return (value === null || value === undefined) ? false : value;
}

export function DynamicSort(property: string, isAscDesc: string) {
    return function (obj1: any, obj2: any) {
        if (isAscDesc === "DESC") {
            return ((obj1[property] > obj2[property]) ? (-1) : ((obj1[property] < obj2[property]) ? (1) : (0)));
        }
        return ((obj1[property] > obj2[property]) ? (1) : ((obj1[property] < obj2[property]) ? (-1) : (0)));
    }
}

export function GetMonthYear(date:Date) {
    if (date === null || date === undefined) {
        return "";
    } else {
        var dt = new Date(date);
        return dt.toLocaleString("default", { month: "short" }) + " " + dt.getFullYear();
    }
}

export function GetMonths(d1:Date, d2:Date) {
    if (d1 === null) d1 = new Date();
    else d1 = new Date(d1);

    if (d2 === null) d2 = new Date();
    else d2 = new Date(d2);   
   
    return humanizeDuration(d2.valueOf() - d1.valueOf(), {
        conjunction: " and ",
        units: ["y", "mo"],
        round: true,
    });
}