import { Types } from "mongoose";
declare function createNewPayment(session: any, status: string): Promise<unknown>;
declare function createNewDelivery(session: any, orderId: any): Promise<import("mongoose").Document<unknown, {}, import("../models/deliveryModel").DeliveryDoc> & import("../models/deliveryModel").DeliveryDoc & Required<{
    _id: unknown;
}>>;
declare function createNewOrder(session: any, paymentId: unknown): Promise<{
    orderItems: {
        productId: Types.ObjectId;
        orderId: unknown;
        sellerId: Types.ObjectId;
        quantity: number;
        salePrice: number;
        totalPrice: number;
        productName: string;
        sku: string;
        image: string;
    }[];
    _id: unknown;
    __v?: any;
    $locals: Record<string, unknown>;
    $model: {
        <ModelType = import("mongoose").Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown> & Required<{
            _id: unknown;
        }>, any>>(name: string): ModelType;
        <ModelType = import("mongoose").Model<import("../models/orderModel").OrderDoc, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../models/orderModel").OrderDoc> & import("../models/orderModel").OrderDoc & Required<{
            _id: unknown;
        }>, any>>(): ModelType;
    } & {
        <ModelType = import("mongoose").Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown> & Required<{
            _id: unknown;
        }>, any>>(name: string): ModelType;
        <ModelType = import("mongoose").Model<any, {}, {}, {}, any, any>>(): ModelType;
    };
    $op: "save" | "validate" | "remove" | null;
    $where: Record<string, unknown>;
    baseModelName?: string;
    collection: import("mongoose").Collection;
    db: import("mongoose").Connection;
    deleteOne: ((options?: import("mongoose").QueryOptions) => import("mongoose").Query<import("mongodb").DeleteResult, import("mongoose").Document<unknown, {}, import("../models/orderModel").OrderDoc> & import("../models/orderModel").OrderDoc & Required<{
        _id: unknown;
    }>, {}, import("../models/orderModel").OrderDoc, "deleteOne", Record<string, never>>) & ((options?: import("mongoose").QueryOptions) => any);
    errors?: import("mongoose").Error.ValidationError;
    get: {
        <T extends keyof import("../models/orderModel").OrderDoc>(path: T, type?: any, options?: any): import("../models/orderModel").OrderDoc[T];
        (path: string, type?: any, options?: any): any;
    } & {
        <T extends string | number | symbol>(path: T, type?: any, options?: any): any;
        (path: string, type?: any, options?: any): any;
    };
    id?: any;
    invalidate: {
        <T extends keyof import("../models/orderModel").OrderDoc>(path: T, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
        (path: string, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
    } & {
        <T extends string | number | symbol>(path: T, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
        (path: string, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
    };
    isDirectModified: {
        <T extends keyof import("../models/orderModel").OrderDoc>(path: T | T[]): boolean;
        (path: string | Array<string>): boolean;
    } & {
        <T extends string | number | symbol>(path: T | T[]): boolean;
        (path: string | Array<string>): boolean;
    };
    isDirectSelected: {
        <T extends keyof import("../models/orderModel").OrderDoc>(path: T): boolean;
        (path: string): boolean;
    } & {
        <T extends string | number | symbol>(path: T): boolean;
        (path: string): boolean;
    };
    isInit: {
        <T extends keyof import("../models/orderModel").OrderDoc>(path: T): boolean;
        (path: string): boolean;
    } & {
        <T extends string | number | symbol>(path: T): boolean;
        (path: string): boolean;
    };
    isModified: {
        <T extends keyof import("../models/orderModel").OrderDoc>(path?: T | T[], options?: {
            ignoreAtomics?: boolean;
        } | null): boolean;
        (path?: string | Array<string>, options?: {
            ignoreAtomics?: boolean;
        } | null): boolean;
    } & {
        <T extends string | number | symbol>(path?: T | T[], options?: {
            ignoreAtomics?: boolean;
        } | null): boolean;
        (path?: string | Array<string>, options?: {
            ignoreAtomics?: boolean;
        } | null): boolean;
    };
    isNew: boolean;
    isSelected: {
        <T extends keyof import("../models/orderModel").OrderDoc>(path: T): boolean;
        (path: string): boolean;
    } & {
        <T extends string | number | symbol>(path: T): boolean;
        (path: string): boolean;
    };
    markModified: {
        <T extends keyof import("../models/orderModel").OrderDoc>(path: T, scope?: any): void;
        (path: string, scope?: any): void;
    } & {
        <T extends string | number | symbol>(path: T, scope?: any): void;
        (path: string, scope?: any): void;
    };
    model: {
        <ModelType = import("mongoose").Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown> & Required<{
            _id: unknown;
        }>, any>>(name: string): ModelType;
        <ModelType = import("mongoose").Model<import("../models/orderModel").OrderDoc, {}, {}, {}, import("mongoose").Document<unknown, {}, import("../models/orderModel").OrderDoc> & import("../models/orderModel").OrderDoc & Required<{
            _id: unknown;
        }>, any>>(): ModelType;
    } & {
        <ModelType = import("mongoose").Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown> & Required<{
            _id: unknown;
        }>, any>>(name: string): ModelType;
        <ModelType = import("mongoose").Model<any, {}, {}, {}, any, any>>(): ModelType;
    };
    schema: import("mongoose").Schema;
    set: {
        <T extends keyof import("../models/orderModel").OrderDoc>(path: T, val: import("../models/orderModel").OrderDoc[T], type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../models/orderModel").OrderDoc> & import("../models/orderModel").OrderDoc & Required<{
            _id: unknown;
        }>;
        (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../models/orderModel").OrderDoc> & import("../models/orderModel").OrderDoc & Required<{
            _id: unknown;
        }>;
        (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../models/orderModel").OrderDoc> & import("../models/orderModel").OrderDoc & Required<{
            _id: unknown;
        }>;
        (value: string | Record<string, any>): import("mongoose").Document<unknown, {}, import("../models/orderModel").OrderDoc> & import("../models/orderModel").OrderDoc & Required<{
            _id: unknown;
        }>;
    } & {
        <T extends string | number | symbol>(path: T, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../models/orderModel").OrderDoc> & import("../models/orderModel").OrderDoc & Required<{
            _id: unknown;
        }>;
        (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../models/orderModel").OrderDoc> & import("../models/orderModel").OrderDoc & Required<{
            _id: unknown;
        }>;
        (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): import("mongoose").Document<unknown, {}, import("../models/orderModel").OrderDoc> & import("../models/orderModel").OrderDoc & Required<{
            _id: unknown;
        }>;
        (value: string | Record<string, any>): import("mongoose").Document<unknown, {}, import("../models/orderModel").OrderDoc> & import("../models/orderModel").OrderDoc & Required<{
            _id: unknown;
        }>;
    };
    toJSON: {
        <T = import("../models/orderModel").OrderDoc & Required<{
            _id: unknown;
        }>>(options?: import("mongoose").ToObjectOptions & {
            flattenMaps?: true;
        }): import("mongoose").FlattenMaps<T>;
        <T = import("../models/orderModel").OrderDoc & Required<{
            _id: unknown;
        }>>(options: import("mongoose").ToObjectOptions & {
            flattenMaps: false;
        }): T;
    } & {
        <T = any>(options?: import("mongoose").ToObjectOptions & {
            flattenMaps?: true;
        }): import("mongoose").FlattenMaps<T>;
        <T = any>(options: import("mongoose").ToObjectOptions & {
            flattenMaps: false;
        }): T;
    };
    toObject: (<T = import("../models/orderModel").OrderDoc & Required<{
        _id: unknown;
    }>>(options?: import("mongoose").ToObjectOptions) => import("mongoose").Require_id<T>) & (<T = any>(options?: import("mongoose").ToObjectOptions) => import("mongoose").Require_id<T>);
    unmarkModified: {
        <T extends keyof import("../models/orderModel").OrderDoc>(path: T): void;
        (path: string): void;
    } & {
        <T extends string | number | symbol>(path: T): void;
        (path: string): void;
    };
    validate: {
        <T extends keyof import("../models/orderModel").OrderDoc>(pathsToValidate?: T | T[], options?: import("mongoose").AnyObject): Promise<void>;
        (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): Promise<void>;
        (options: {
            pathsToSkip?: import("mongoose").pathsToSkip;
        }): Promise<void>;
    } & {
        <T extends string | number | symbol>(pathsToValidate?: T | T[], options?: import("mongoose").AnyObject): Promise<void>;
        (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): Promise<void>;
        (options: {
            pathsToSkip?: import("mongoose").pathsToSkip;
        }): Promise<void>;
    };
    validateSync: {
        (options: {
            pathsToSkip?: import("mongoose").pathsToSkip;
            [k: string]: any;
        }): import("mongoose").Error.ValidationError | null;
        <T extends keyof import("../models/orderModel").OrderDoc>(pathsToValidate?: T | T[], options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
        (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
    } & {
        (options: {
            pathsToSkip?: import("mongoose").pathsToSkip;
            [k: string]: any;
        }): import("mongoose").Error.ValidationError | null;
        <T extends string | number | symbol>(pathsToValidate?: T | T[], options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
        (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
    };
    userId: Types.ObjectId;
    deliveryId: Types.ObjectId;
    paymentId: Types.ObjectId;
    totalAmount: number;
    taxAmount: number;
    shippingAmount: number;
    discountAmount: number;
    orderStatus: import("./constants").OrderStatus;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}>;
declare function updateOrderStatus(orderId: string, newStatus: string): Promise<void>;
export { createNewOrder, createNewDelivery, createNewPayment, updateOrderStatus, };
