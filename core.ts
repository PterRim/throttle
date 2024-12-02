
import { reference_store } from "ppropogator/Helper/Helper";
import { add_cell_content, cell_strongest, cell_strongest_base_value, cell_strongest_value, construct_cell, type Cell } from "ppropogator/Cell/Cell";
import { compound_propagator, constraint_propagator, construct_propagator, primitive_propagator, type Propagator } from "ppropogator/Propagator/Propagator";
import { set_immediate_execute } from "ppropogator/Shared/Reactivity/Scheduler";
import { annotate_now, stale } from "./traced_timestamp";
import { construct_effect_propagator as construct_effect_propagator  } from "./reactive_propagator";
import { construct_reactor } from "ppropogator/Shared/Reactivity/Reactor";
import type { LayeredObject } from "sando-layer/Basic/LayeredObject";

const new_reference_name = reference_store();


export type Node<E> = Cell // or signal in other reactive system

export function construct_node<E>(name: string): Node<E> {
    return construct_cell(name + new_reference_name());
}

export type Connection<A,B> = Effect<A, B> | Relationship<A, B>

// effect is mono-directional , which is analogously to Event in conventional reactive system
export type Effect<A,B> = (...nodes: Node<A>[]) => Propagator 

export function construct_effect<A, B>(name: string, f: (...o: LayeredObject[]) => B): Effect<A, B> {
    // operator is propagators but it returned a cell
    return (...nodes: Node<A>[]) => {
        const last_index = nodes.length - 1
        const output = nodes[last_index];
        const inputs = nodes.slice(0, last_index );
        return construct_effect_propagator(name, f)(inputs, output);
    }
}

// Relationship is multi-directional, you can say it is like behavior, but it is not exactly the same
export type Relationship<A, B> = (...nodes: Node<A>[]) => Propagator

export function construct_relationship<A, B>(name: string, f: (...inputs: Node<A>[]) => void): Relationship<A, B>{
    return (...inputs: Node<A>[]) => {

        return  constraint_propagator(
            inputs, 
            () => {
                f(...inputs); 
                // just for test
                return construct_reactor();
            }, 
            name )
    }
}


export function connect<A, B>(a: Node<A>, b: Node<B>, behavior: Connection<A, B>){
    // the behavior is a propagator
    return behavior(a, b);
}

export function broadcast<A, B>(a: Node<A>, bs: Node<B>[], behavior: Connection<A, B>){
    return bs.map(b => connect(a, b, behavior));
} 

export function combine<A, B>(as: Node<A>[], b: Node<B>, behavior: Connection<A, B>){
    return as.map(a => connect(a, b, behavior));
}


export function update<A>(a: Node<A>, v: A){
    // refresh the old dependencies
    stale(cell_strongest_value(a))
    // supposely timestamp should work but javascript calculate time differently it will not work
    add_cell_content(a, annotate_now(v));
}



export const set_immediate_execution = () => set_immediate_execute(true);
