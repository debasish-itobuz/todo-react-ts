import { cleanEnv, num, str } from "envalid";
const env = cleanEnv(process.env, {
  PORT: num(),
  CONNECTION_STRING: str(),
  SECRET_KEY : str()
});
export { env };
