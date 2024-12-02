import { register_predicate } from "generic-handler/Predicates";

export const no_compute = "no_compute"

export type NoCompute = typeof no_compute;

export const is_no_compute = register_predicate("is_no_compute", (a: any) => a === no_compute);