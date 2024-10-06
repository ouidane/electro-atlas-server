import { PassportStatic } from "passport";
declare module "express" {
    interface Request {
        user?: any;
    }
}
declare const _default: (passport: PassportStatic) => void;
export default _default;
