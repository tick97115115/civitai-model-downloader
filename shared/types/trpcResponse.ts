import { type } from "arktype";

export const stdRes = type({
  code: type.enumerated(200, 404, 408, 500),
  message: "string",
});
export type StdRes = typeof stdRes.infer;
