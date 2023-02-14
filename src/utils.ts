import { ModelOption } from ".";

type MODEL = "text-davinci-002-render-paid" | "text-davinci-002-render-sha";

const MODEL_ID_MAP: { [key in ModelOption]: MODEL } = {
  Legacy: "text-davinci-002-render-paid",
  Default: "text-davinci-002-render-sha",
};

export function getModelId(model: ModelOption): MODEL {
  const modelId = MODEL_ID_MAP[model];

  if (!modelId) {
    throw new Error(
      `Invalid model option: ${model}. Valid options are "Default" and "Legacy".`
    );
  }
  return modelId;
}
