const DEFAULT_AWS_REGION = 'eu-west-2';
const DEFAULT_BEDROCK_MODEL_ID = 'amazon.nova-pro-v1:0';

export function getAwsRegion(): string {
  return process.env.AWS_REGION ?? DEFAULT_AWS_REGION;
}

export function getBedrockModelId(): string {
  return process.env.BEDROCK_MODEL_ID ?? DEFAULT_BEDROCK_MODEL_ID;
}
