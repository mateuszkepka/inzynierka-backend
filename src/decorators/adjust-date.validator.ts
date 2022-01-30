import { adjustTimeZone } from "src/utils/date-util";
import { ColumnOptions, getMetadataArgsStorage } from "typeorm";

export function AdjustDate(options?: ColumnOptions): Function {
    return function (object: Object, propertyName: string) {
        getMetadataArgsStorage().columns.push({
            target: object.constructor,
            propertyName: propertyName,
            mode: "regular",
            options: {
                type: "timestamp",
                transformer: {
                    to(value) {
                        if (value) {
                            return adjustTimeZone(value.valueOf());
                        }
                    },
                    from(value) {
                        if (value) {
                            return adjustTimeZone(value.valueOf(), true);
                        }
                    },
                },
                ...options
            },
        });
    };
} 