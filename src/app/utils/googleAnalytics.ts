import { sendGAEvent } from "@next/third-parties/google";

export const trackGAEvent = (
  eventName: string,
  data: Record<string, unknown>
) => {
  sendGAEvent("event", eventName, data);
};
