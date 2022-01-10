import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";

export function IsGreaterThan(property: string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'IsGreaterThan',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;
                    const relatedValue = (args.object as any)[relatedPropertyName];
                    return typeof value === 'number' && typeof relatedValue === 'number' && value * 2 >= relatedValue;
                },
            },
        });
    };
}