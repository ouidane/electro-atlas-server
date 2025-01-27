import { Document, Schema } from "mongoose";

export interface ProductSpecificationsDoc extends Document {
  certifications: string;
  itemModelNumber?: string;
  weight?: string;
  dimensions?: string;
  connectivity?: string;
  aspectRatio?: string;
  displayTechnology?: string;
  refreshRate?: string;
  resolution?: string;
  screenSize?: string;
  CameraFrameRate?: string;
  opticalZoom?: string;
  meteringDescription?: string;
  supportedFileFormat?: string;
  maximumAperture?: string;
  imageStabilization?: string;
  maximumFocalLength?: string;
  expandedIsoMinimum?: string;
  photoSensorTechnology?: string;
  maximumWebcamImageResolution?: string;
  batteries?: string;
  videoCaptureResolution?: string;
  flashMemoryType?: string;
  printingTechnology?: string;
  printerOutput?: string;
  maximumPrintSpeed?: string;
  printerMediaSizeMaximum?: string;
  printMedia?: string;
  scannerType?: string;
  compatibleDevices?: string;
  displayType?: string;
  sheetSize?: string;
  zoom?: string;
  digitalZoom?: string;
  lensConstruction?: string;
  lensType?: string;
  videoOutput?: string;
  photoSensorResolution?: string;
  audioInput?: string;
  audioOutputType?: string;
  batteryAverageLife?: string;
  sensorType?: string;
  totalStillResolution?: string;
  maximumImageSize?: string;
  compatibleMountings?: string;
  maxPrintspeedMonochrome?: string;
  controllerType?: string;
  shape?: string;
  gps?: string;
  chipsetBrand?: string;
  videoOutputInterface?: string;
  cacheSize?: string;
  graphicsCardDescription?: string;
  numberOfProcessors?: string;
  hardDiskFormFactor?: string;
  hardDiskDescription?: string;
  installationType?: string;
  movementDetectionTechnology?: string;
  mediaType?: string;
  colorDepth?: string;
  standardSheetCapacity?: string;
  opticalSensorTechnology?: string;
  AudioEncoding?: string;
  AudioOutputMode?: string;
  TotalHdmiPorts?: string;
  surroundSoundChannelConfiguration?: string;
  careInstructions?: string;
  speakerMaximumOutputPower?: string;
  speakerMaximumVolume?: string;
  fabricType?: string;
  origin?: string;
  operatingSystem?: string;
  cellularTechnology?: string;
  batteryPowerRating?: string;
  batteryCapacity?: string;
  wirelessNetworkTechnology?: string;
  material?: string;
  connectorType?: string;
  inputVoltage?: string;
  mountingType?: string;
  humanInterfaceInput?: string;
  WirelessCommunicationStandard?: string;
  department?: string;
  specificUsesForProduct?: string;
  ramSize?: string;
  ramMemoryTechnology?: string;
  memorySpeed?: string;
  cpuSpeed?: string;
  cpuModel?: string;
  cpuBrand?: string;
  hardDriveInterface?: string;
  hardDriveSize?: string;
  hardDrive?: string;
  graphicsCoprocessor?: string;
  graphicsRamSize?: string;
  compatiblePlatform?: string;
  lockType?: string;
  finishType?: string;
  lampType?: string;
  shadeColor?: string;
  shadeMaterial?: string;
  switchType?: string;
  brightness?: string;
  lightingMethod?: string;
  controlType?: string;
  controlMethod?: string;
  bulbShapeSize?: string;
  bulbBase?: string;
  lightColor?: string;
  capacity?: string;
  cutType?: string;
  telephoneType?: string;
  powerSource?: string;
  answeringSystemType?: string;
  supportedInternetServices?: string;
  memoryStorageCapacity?: string;
  wirelessCarrier?: string;
  formFactor?: string;
}

export const ProductSpecificationsSchema = new Schema<ProductSpecificationsDoc>(
  {
    certifications: { type: String },
    itemModelNumber: { type: String },
    weight: { type: String },
    dimensions: { type: String },
    connectivity: { type: String },
    aspectRatio: { type: String },
    displayTechnology: { type: String },
    refreshRate: { type: String },
    resolution: { type: String },
    screenSize: { type: String },
    CameraFrameRate: { type: String },
    opticalZoom: { type: String },
    meteringDescription: { type: String },
    supportedFileFormat: { type: String },
    maximumAperture: { type: String },
    imageStabilization: { type: String },
    maximumFocalLength: { type: String },
    expandedIsoMinimum: { type: String },
    photoSensorTechnology: { type: String },
    maximumWebcamImageResolution: { type: String },
    batteries: { type: String },
    videoCaptureResolution: { type: String },
    flashMemoryType: { type: String },
    printingTechnology: { type: String },
    printerOutput: { type: String },
    maximumPrintSpeed: { type: String },
    printerMediaSizeMaximum: { type: String },
    printMedia: { type: String },
    scannerType: { type: String },
    compatibleDevices: { type: String },
    displayType: { type: String },
    sheetSize: { type: String },
    zoom: { type: String },
    digitalZoom: { type: String },
    lensConstruction: { type: String },
    lensType: { type: String },
    videoOutput: { type: String },
    photoSensorResolution: { type: String },
    audioInput: { type: String },
    audioOutputType: { type: String },
    batteryAverageLife: { type: String },
    sensorType: { type: String },
    totalStillResolution: { type: String },
    maximumImageSize: { type: String },
    compatibleMountings: { type: String },
    maxPrintspeedMonochrome: { type: String },
    controllerType: { type: String },
    shape: { type: String },
    gps: { type: String },
    chipsetBrand: { type: String },
    videoOutputInterface: { type: String },
    cacheSize: { type: String },
    graphicsCardDescription: { type: String },
    numberOfProcessors: { type: String },
    hardDiskFormFactor: { type: String },
    hardDiskDescription: { type: String },
    installationType: { type: String },
    movementDetectionTechnology: { type: String },
    mediaType: { type: String },
    colorDepth: { type: String },
    standardSheetCapacity: { type: String },
    opticalSensorTechnology: { type: String },
    AudioEncoding: { type: String },
    AudioOutputMode: { type: String },
    TotalHdmiPorts: { type: String },
    surroundSoundChannelConfiguration: { type: String },
    careInstructions: { type: String },
    speakerMaximumOutputPower: { type: String },
    speakerMaximumVolume: { type: String },
    fabricType: { type: String },
    origin: { type: String },
    operatingSystem: { type: String },
    cellularTechnology: { type: String },
    batteryPowerRating: { type: String },
    batteryCapacity: { type: String },
    wirelessNetworkTechnology: { type: String },
    material: { type: String },
    connectorType: { type: String },
    inputVoltage: { type: String },
    mountingType: { type: String },
    humanInterfaceInput: { type: String },
    WirelessCommunicationStandard: { type: String },
    department: { type: String },
    specificUsesForProduct: { type: String },
    ramSize: { type: String },
    ramMemoryTechnology: { type: String },
    memorySpeed: { type: String },
    cpuSpeed: { type: String },
    cpuModel: { type: String },
    cpuBrand: { type: String },
    hardDriveInterface: { type: String },
    hardDriveSize: { type: String },
    hardDrive: { type: String },
    graphicsCoprocessor: { type: String },
    graphicsRamSize: { type: String },
    compatiblePlatform: { type: String },
    lockType: { type: String },
    finishType: { type: String },
    lampType: { type: String },
    shadeColor: { type: String },
    shadeMaterial: { type: String },
    switchType: { type: String },
    brightness: { type: String },
    lightingMethod: { type: String },
    controlType: { type: String },
    controlMethod: { type: String },
    bulbShapeSize: { type: String },
    bulbBase: { type: String },
    lightColor: { type: String },
    capacity: { type: String },
    cutType: { type: String },
    telephoneType: { type: String },
    powerSource: { type: String },
    answeringSystemType: { type: String },
    supportedInternetServices: { type: String },
    memoryStorageCapacity: { type: String },
    wirelessCarrier: { type: String },
    formFactor: { type: String },
  }
);
