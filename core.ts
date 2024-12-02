
import { reference_store } from "ppropogator/Helper/Helper";
import { add_cell_content, cell_strongest, cell_strongest_base_value, cell_strongest_value, construct_cell, type Cell } from "ppropogator/Cell/Cell";
import { compound_propagator, constraint_propagator, construct_propagator, primitive_propagator, type Propagator } from "ppropogator/Propagator/Propagator";
import { set_immediate_execute } from "ppropogator/Shared/Reactivity/Scheduler";
import { annotate_now, stale } from "./traced_timestamp";
import { construct_effect_propagator as construct_effect_propagator  } from "./reactive_propagator";
import { construct_reactor } from "ppropogator/Shared/Reactivity/Reactor";
import type { LayeredObject } from "sando-layer/Basic/LayeredObject";

const new_reference_name = reference_store();


export type Node = Cell // or signal in other reactive system

export function construct_node(name: string){
    return construct_cell(name + new_reference_name());
}

export type Behavior = Effect | Relationship

// effect is mono-directional , which is analogously to Event in conventional reactive system
export type Effect = (...nodes: Node[]) => Propagator 

export function construct_effect(name: string, f: (...o: LayeredObject[]) => any): Effect{
    // operator is propagators but it returned a cell
    return (...nodes: Node[]) => {
        const last_index = nodes.length - 1
        const output = nodes[last_index];
        const inputs = nodes.slice(0, last_index );
        return construct_effect_propagator(name, f)(inputs, output);
    }
}

// Relationship is multi-directional, you can say it is like behavior, but it is not exactly the same
export type Relationship = (...nodes: Node[]) => Propagator

export function construct_relationship(name: string, f: (...inputs: any[]) => any): Relationship{
    return (...inputs: Node[]) => {

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


export function connect(a: Node, b: Node, behavior: Behavior){
    // the behavior is a propagator
    return behavior(a, b);
}

export function broadcast(a: Node, bs: Node[], behavior: Behavior){
    return bs.map(b => connect(a, b, behavior));
} 

export function combine(as: Node[], b: Node, behavior: Behavior){
    return as.map(a => connect(a, b, behavior));
}


export function update(a: Node, v: any){
    // refresh the old dependencies
    stale(cell_strongest_value(a))
    // supposely timestamp should work but javascript calculate time differently it will not work
    add_cell_content(a, annotate_now(v));
}



export const set_immediate_execution = () => set_immediate_execute(true);
