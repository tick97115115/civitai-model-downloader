import { type } from "arktype";

// https://www.jsondiff.com/ 找到共有属性名

export const model_types = type(
  "'Checkpoint' | 'TextualInversion' | 'Hypernetwork' | 'AestheticGradient' | 'LORA' | 'Controlnet' | 'Poses' | 'LoCon' | 'DoRA' | 'Other' | 'MotionModule' | 'Upscaler' | 'VAE' | 'Wildcards' | 'Workflows' | 'Detection'"
);
export type ModelTypes = typeof model_types.infer;

export const models_request_period = type(
  "'AllTime' | 'Day' | 'Week' | 'Month' | 'Year'"
);
export type ModelsRequestPeriod = typeof models_request_period.infer;

export const allowCommercialUse = type(
  "'Image' | 'RentCivit' | 'Rent' | 'Sell' | 'None'"
);
export type AllowCommercialUse = typeof allowCommercialUse.infer;

export const models_request_sort = type(
  "'Highest Rated' | 'Most Downloaded' | 'Newest'"
);
export type ModelsRequestSort = typeof models_request_sort.infer;

export const nsfwLevel = type("'None' | 'Soft' | 'Mature' | 'X' | 'Blocked'");
export type NsfwLevel = typeof nsfwLevel.infer;

export const checkpointType = type("'Merge' | 'Trained'");
export type CheckpointType = typeof checkpointType.infer;

export const baseModels = type.enumerated(
  "Aura Flow",
  "CogVideoX",
  "Flux .1 D",
  "Flux .1 S",
  "HiDream",
  "Hunyuan 1",
  "Hunyuan Video",
  "Illustrious",
  "Kolors",
  "LTXV",
  "Lumina",
  "Mochi",
  "NoobAI",
  "ODOR",
  "Open AI",
  "Other",
  "PixArt E",
  "PixArt a",
  "Playground v2",
  "Pony",
  "SD 1.4",
  "SD 1.5",
  "SD 1.5 Hyper",
  "SD 1.5 LCM",
  "SD 2.0",
  "SD 2.0 768",
  "SD 2.1",
  "SD 2.1 768",
  "SD 2.1 Unclip",
  "SD 3",
  "SD 3.5",
  "SD 3.5 Large",
  "SD 3.5 Large Turbo",
  "SD 3.5 Medium",
  "SDXL 0.9",
  "SDXL 1.0",
  "SDXL 1.0 LCM",
  "SDXL Distilled",
  "SDXL Hyper",
  "SDXL Lightning",
  "SDXL Turbo",
  "SDXL Turbo",
  "SVD",
  "SVD XT",
  "Stable Cascade",
  "WAN Video"
);
export type BaseModels = typeof baseModels.infer;
