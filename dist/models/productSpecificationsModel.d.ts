import { Document, Schema } from "mongoose";
export interface ProductSpecificationsDoc extends Document {
    certifications: string;
    ramSize?: number;
    graphics?: string;
    processor?: string;
    cpuSpeed?: number;
    cpuManufacturer?: string;
    graphicsProcessorManufacturer?: string;
    hardDriveSize?: number;
    screenSize?: number;
    resolution?: string;
    storage?: number;
    memory?: number;
    cameraResolution?: number;
    operatingSystem?: string;
    audioOutput?: string;
    connectivity?: string;
    batteryLife?: number;
    weight?: number;
    sensor?: string;
    waterResistance?: boolean;
    fitnessTracking?: boolean;
    sleepTracking?: boolean;
    compatiblePlatform?: string;
    voiceControl?: boolean;
    energyEfficiency?: string;
    remoteControl?: boolean;
}
export declare const ProductSpecificationsSchema: Schema<ProductSpecificationsDoc, import("mongoose").Model<ProductSpecificationsDoc, any, any, any, Document<unknown, any, ProductSpecificationsDoc> & ProductSpecificationsDoc & Required<{
    _id: unknown;
}>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProductSpecificationsDoc, Document<unknown, {}, import("mongoose").FlatRecord<ProductSpecificationsDoc>> & import("mongoose").FlatRecord<ProductSpecificationsDoc> & Required<{
    _id: unknown;
}>>;
