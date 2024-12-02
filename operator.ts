
import type { LayeredObject } from "sando-layer/Basic/LayeredObject";
import { connect, construct_relationship, construct_effect, construct_node } from "./core";
import { no_compute } from "./no_compute";
import { get_base_value } from "sando-layer/Basic/Layer";
import { map as generic_map } from "generic-handler/built_in_generics/generic_array_operation";
import { fresher, get_traced_timestamp } from "./traced_timestamp";
import type { Effect, Node } from "./core";
import { cell_strongest } from "ppropogator/Cell/Cell";
import { compose } from "generic-handler/built_in_generics/generic_combinator";
// event? relationship?
// reduce?
// switch? until? or? and?

export const curried_generic_map  = (f: (a: any) => any) => (a: any[]) => generic_map(a, f);

export const make_operator = (name: string, f: (a: LayeredObject) => any) => {
    // syntax sugar
    return (input: Node<any>) => {
        const output = construct_node(name);
        const rf = (a: LayeredObject) => f(get_base_value(a));

        const effect = construct_effect(name, rf)
        connect(input, output, effect);
        return output;
    }
}

export const subscribe = (f: (a: any) => void) => (a: Node<any>) => {
    cell_strongest(a).subscribe(compose(get_base_value, f));
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


export const until = (when: Node<boolean>, then: Node<any>) => {
    const output = construct_node("until");
    construct_effect("until", (w: LayeredObject, t: LayeredObject) => {
        if (get_base_value(w) === true){
            return t
        }
        else{
            return no_compute
        }
    })(output, when, then);
    return output;
}

export const or = (a: Node<any>, b: Node<any>) => {
    const output = construct_node("or");
    construct_effect("or", (a: LayeredObject, b: LayeredObject) => {
        if (fresher(a, b)){
            return a;
        }
        else if (fresher(b, a)){
            return b;
        }
        else{
            return a
        }
    })(output, a, b);
    return output;
}

