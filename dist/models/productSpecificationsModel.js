"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductSpecificationsSchema = void 0;
const mongoose_1 = require("mongoose");
exports.ProductSpecificationsSchema = new mongoose_1.Schema({
    certifications: {
        type: String,
        enum: {
            values: [
                "ASTM Certified",
                "Australian Made",
                "Eco Friendly",
                "Fair Trade",
                "Made in Morocco",
                "Swiss Made",
                "Hong Kong Made",
                "Made in Turkey",
            ],
            message: "certifications is required.",
        },
        required: [true, "certifications is required."], // Certifications for product adherence (All categories)
    },
    ramSize: {
        type: Number, // Random Access Memory size in GB (Computers, Smartphones & Tablets) - e.g. 16GB, 8GB
    },
    graphics: {
        type: String, // Graphics processor information (Computers, Gaming Consoles) - e.g. NVIDIA GeForce RTX 3080, AMD Radeon RX 6900 XT
    },
    processor: {
        type: String, // Type of processor (Computers, Smartphones & Tablets) - e.g. Intel Core i7, AMD Ryzen 7
    },
    cpuSpeed: {
        type: Number, // Processor speed in GHz (Computers, Smartphones & Tablets) - e.g. 3.6 GHz, 2.8 GHz
    },
    cpuManufacturer: {
        type: String, // CPU manufacturer (Computers, Smartphones & Tablets) - e.g. AMD , Qualcomm
    },
    graphicsProcessorManufacturer: {
        type: String, // Graphics processor manufacturer (Computers, Gaming Consoles) - e.g. AMD, NVIDIA
    },
    screenSize: {
        type: Number, // Display size in inches (Computers, Smartphones & Tablets, TVs) - e.g. 6.7 inches, 10.1 inches
    },
    resolution: {
        type: String, // Display resolution (Computers, Smartphones & Tablets, TVs) - e.g. 1920x1080, 2560x1440
    },
    storage: {
        type: Number, // Storage capacity in GB (Computers, Smartphones & Tablets, Cameras) - e.g. 256GB, 128GB
    },
    memory: {
        type: Number, // Memory capacity in GB (Computers, Smartphones & Tablets, Cameras) - e.g. 8GB, 4GB
    },
    cameraResolution: {
        type: Number, // Camera resolution in megapixels (Cameras, Smartphones & Tablets) - e.g. 12MP, 8MP
    },
    operatingSystem: {
        type: String, // Operating system used (Computers, Smartphones & Tablets) - e.g. Windows 11, Android 12
    },
    audioOutput: {
        type: String, // Audio output details (Computers, Smartphones & Tablets, Audio Devices) - e.g. Dolby Atmos, DTS:X
    },
    connectivity: {
        type: String, // Connectivity options (All categories requiring connectivity) - e.g. Bluetooth 5.0, Wi-Fi 6
    },
    batteryLife: {
        type: Number, // Battery life in hours (Smartphones & Tablets, Wearable Technology, Computers) - e.g. 10 hours, 15 hours
    },
    weight: {
        type: Number, // Device weight in Kg (Smartphones & Tablets, Wearable Technology) - e.g. 1Kg, 1.5Kg
    },
    sensor: {
        type: String, // Included sensors (Wearable Technology) - e.g. Heart Rate, GPS, Accelerometer
    },
    waterResistance: {
        type: Boolean, // Water resistance capability (Wearable Technology, Smartphones & Tablets)
    },
    fitnessTracking: {
        type: Boolean, // Fitness tracking feature availability (Wearable Technology)
    },
    sleepTracking: {
        type: Boolean, // Sleep tracking feature availability (Wearable Technology)
    },
    compatiblePlatform: {
        type: String, // Compatible platforms (Smart Home Devices, Gaming Consoles) - e.g. Amazon Alexa, Google Assistant
    },
    voiceControl: {
        type: Boolean, // Voice control feature availability (Smart Home Devices, Gaming Consoles)
    },
    energyEfficiency: {
        type: String, // Energy efficiency certification (Smart Home Devices) - e.g. Energy Star Certified, Not certified
    },
    remoteControl: {
        type: Boolean, // Remote control capability (Smart Home Devices, Gaming Consoles)
    },
});
//# sourceMappingURL=productSpecificationsModel.js.map