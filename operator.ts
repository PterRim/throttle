
import type { LayeredObject } from "sando-layer/Basic/LayeredObject";
import { connect, construct_relationship, construct_effect, construct_node } from "./core";
import { no_compute } from "./no_compute";
import { get_base_value } from "sando-layer/Basic/Layer";
import { compose } from "generic-handler/built_in_generics/generic_combinator";
import { map as generic_map } from "generic-handler/built_in_generics/generic_array_operation";

// event? relationship?
// reduce?
// switch? until? or? and?

export const curried_generic_map  = (f: (a: any) => any) => (a: any[]) => generic_map(a, f);

export const make_operator = (name: string, f: (...a: any[]) => any) => {
    // syntax sugar
    (...inputs: any[]) => {
        const output = construct_node(name);
        const rf = (...a: LayeredObject[]) => f(...a.map(get_base_value));

        const effect = construct_effect(name, rf)
        connect(inputs, output, effect);
        return [output];
    }
}

export const func_e = (name: string, f: (a: any) => any) => {
    return make_operator(name, f);
}

export const apply_e = (f: (a: any) => any) => {
    return make_operator("apply", f);
}

export const map_e = (f: (a: any) => any) => {
   return make_operator("map", f);
}

export const filter_e = (f: (a: any) => boolean) => {
    return make_operator("filter", (base: any) => {
        if (f(base)){
            return base;
        }
        else{
            return no_compute;
        }
    });
}

export const reduce_e = (f: (a: any, b: any) => any, initial: any) => {
    let acc = initial;
    return construct_effect("reduce", (base: any) => {
        acc = f(acc, base);
        return acc;
    });
}

